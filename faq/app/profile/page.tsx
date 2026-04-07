'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  setDoc,
  getDoc
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
  const [authName, setAuthName] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);
  const chatEndRef = useRef(null);
  const menuruTextRef = useRef(null);
  const menuruContainerRef = useRef(null);
  
  const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

  // Table data with detailed content - Awwwards inspired, no emojis
  const tableData = [
    {
      id: 1,
      title: "NOTES",
      subtitle: "Capture & Organize",
      description: "Buat dan kelola catatan penting Anda dengan mudah",
      link: "/notes",
      detailedContent: {
        overview: "A comprehensive note-taking system designed for seamless ideation and information management. Transform your thoughts into structured, searchable knowledge.",
        features: [
          "Real-time sync across all devices",
          "Advanced search with natural language processing",
          "Rich text formatting with markdown support",
          "Voice-to-text transcription",
          "Image and file attachment system",
          "Collaborative editing capabilities",
          "Version history and restore points",
          "Smart tags and category organization"
        ],
        benefits: "Elevate your productivity with a note-taking ecosystem that adapts to your workflow. Never lose an idea again with intelligent organization and instant retrieval.",
        stats: "10,000+ active users"
      }
    },
    {
      id: 2,
      title: "DONATION",
      subtitle: "Support Causes",
      description: "Bantu mereka yang membutuhkan melalui donasi Anda",
      link: "/donation",
      detailedContent: {
        overview: "A transparent and secure platform for charitable giving. Connect with verified causes and track the impact of your contributions in real-time.",
        features: [
          "Blockchain-verified transactions",
          "Real-time impact tracking",
          "Monthly subscription options",
          "Tax-deductible receipts",
          "Cause verification system",
          "Anonymous giving available",
          "Corporate matching programs",
          "Disaster response fund"
        ],
        benefits: "Transform generosity into measurable change. Every contribution creates a ripple effect of positive impact in communities worldwide.",
        stats: "Rp 5B+ funds distributed"
      }
    },
    {
      id: 3,
      title: "COMMUNITY",
      subtitle: "Connect & Share",
      description: "Bergabung dengan komunitas dan berbagi ide",
      link: "/community",
      detailedContent: {
        overview: "A vibrant ecosystem of creators, thinkers, and innovators. Engage in meaningful discussions and collaborative projects that shape the future.",
        features: [
          "Topic-based discussion forums",
          "Live video events and workshops",
          "Peer-to-peer mentorship program",
          "Project collaboration tools",
          "Resource library and knowledge base",
          "Badge and achievement system",
          "Weekly challenges and hackathons",
          "Industry expert AMAs"
        ],
        benefits: "Join a network of forward-thinking individuals. Accelerate your growth through shared knowledge and collective intelligence.",
        stats: "50,000+ community members"
      }
    },
    {
      id: 4,
      title: "CALENDAR",
      subtitle: "Schedule & Plan",
      description: "Atur jadwal dan rencana kegiatan Anda",
      link: "/calendar",
      detailedContent: {
        overview: "Intelligent time management solution that adapts to your rhythm. Seamlessly coordinate personal and professional commitments.",
        features: [
          "Smart scheduling assistant",
          "Multi-calendar integration",
          "Time-blocking optimization",
          "Recurring event automation",
          "Custom reminder workflows",
          "Team availability sharing",
          "Analytics and time tracking",
          "API for custom integrations"
        ],
        benefits: "Master your time with predictive scheduling and intelligent reminders. Focus on what matters while we handle the logistics.",
        stats: "1M+ events managed monthly"
      }
    }
  ];

  // Check if user is admin
  const checkIsAdmin = (user) => {
    return user?.email === ADMIN_EMAIL;
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
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
        
        await setDoc(doc(db, "chat_users", user.uid), {
          name: userData.name,
          email: userData.email,
          isAdmin: isAdmin,
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
      } else {
        setCurrentUser(null);
        setIsAdminMode(false);
      }
    });

    const q = query(collection(db, "chat_messages"), orderBy("timestamp", "asc"));
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
        addDoc(collection(db, "chat_messages"), {
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

  // Modern GSAP Scroll Animation for MENURU text
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!menuruTextRef.current || !menuruContainerRef.current) return;
    
    // Refresh ScrollTrigger to ensure proper initialization
    ScrollTrigger.refresh();
    
    // Set initial state - completely hidden at bottom with blur
    gsap.set(menuruTextRef.current, {
      opacity: 0,
      y: 200,
      scale: 0.8,
      rotationX: 45,
      filter: "blur(20px)",
      transformOrigin: "center center",
      transformStyle: "preserve-3d"
    });
    
    // Create the scroll-triggered animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: menuruContainerRef.current,
        start: "top 90%",
        end: "top 30%",
        scrub: 1.2,
        toggleActions: "play reverse play reverse",
        markers: false,
        invalidateOnRefresh: true
      }
    });
    
    // Animate to final position with smooth easing
    tl.to(menuruTextRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      filter: "blur(0px)",
      duration: 1.5,
      ease: "power2.out",
      stagger: 0.1
    });
    
    // Add a subtle scale pulse when fully visible
    ScrollTrigger.create({
      trigger: menuruContainerRef.current,
      start: "top 20%",
      end: "top 0%",
      scrub: 0.5,
      onUpdate: (self) => {
        if (self.progress > 0.8 && menuruTextRef.current) {
          gsap.to(menuruTextRef.current, {
            scale: 1.02,
            duration: 0.3,
            ease: "power1.out"
          });
        }
      }
    });
    
    return () => {
      // Clean up all ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === menuruContainerRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  const handleAuth = async () => {
    setAuthError("");
    
    try {
      if (isLoginMode) {
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        console.log("User signed in:", userCredential.user.email);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        
        if (authName) {
          await userCredential.user.updateProfile({
            displayName: authName
          });
        }
        
        console.log("User created:", userCredential.user.email);
      }
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
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
      await addDoc(collection(db, "chat_messages"), {
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

  const toggleExpand = (itemId) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      paddingTop: '120px',
      paddingBottom: '80px',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* HEADER with Breadcrumb */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '0 1rem' : '0 2rem'
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M17 7L7 17" />
              <path d="M7 7h10v10" />
            </svg>
            <span style={{ color: 'white', fontWeight: '400', letterSpacing: '0.5px' }}>Back</span>
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
                <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '400' }}>
                  {currentUser.name}
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
                    fontSize: '0.75rem',
                    fontWeight: '400'
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
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '400'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                onClick={() => router.push('/')}
                style={{
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: '400',
                  transition: 'color 0.2s ease'
                }}
                whileHover={{ color: 'white' }}
              >
                Home
              </motion.span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
              <span style={{ color: 'white', fontWeight: '400' }}>MENURU</span>
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
          backgroundColor: '#ffffff',
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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
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
              backgroundColor: '#111111',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 199,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{
              padding: '1rem',
              backgroundColor: '#1a1a1a',
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

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
                  backgroundColor: '#1a1a1a',
                  padding: '2rem',
                  borderRadius: '12px',
                  width: '320px',
                  maxWidth: '90%'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '1rem', fontWeight: '500' }}>
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
                  
                  {!isLoginMode && (
                    <input
                      type="text"
                      placeholder="Name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#111111',
                        color: 'white',
                        fontSize: '0.9rem'
                      }}
                    />
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
                      backgroundColor: '#111111',
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
                      backgroundColor: '#111111',
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
                        setAuthName("");
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

            {currentUser && (
              <div style={{
                padding: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#111111'
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
                      backgroundColor: '#1a1a1a',
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
                    Admin: faridardiansyah061@gmail.com
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

      {/* MAIN CONTENT - AWWARDS INSPIRED LARGE TABLE */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '0 1rem' : '0 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* TWO-LINE TITLE */}
        <motion.div 
          style={{ marginBottom: '4rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '2rem' : '72px',
            lineHeight: 1.1,
            margin: 0,
            fontWeight: '400',
            width: '100%',
            letterSpacing: '-0.02em'
          }}>
            <div>You can take notes,</div>
            <div>find ideas, and donate money to those in need</div>
          </h1>
        </motion.div>

        <motion.p 
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: isMobile ? '1rem' : '20px',
            maxWidth: '700px',
            marginBottom: '6rem',
            fontWeight: '400',
            lineHeight: 1.5
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          From concept to brand, I work and think watch to watch with expert developers and designers to media social — perseverance the intuitive with the curious to create delightful and engaging experiences for the world wide web
        </motion.p>

        {/* AWWARDS STYLE LARGE TABLE */}
        <div>
          {tableData.map((item, index) => (
            <React.Fragment key={item.id}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => toggleExpand(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isMobile ? '1.5rem 0' : '2rem 0',
                  borderTop: index === 0 ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  marginLeft: '-1rem',
                  marginRight: '-1rem'
                }}
              >
                {/* Left Column - Large Title */}
                <div style={{
                  width: '25%',
                  flexShrink: 0
                }}>
                  <div style={{
                    color: 'white',
                    fontSize: isMobile ? '1.5rem' : '2.5rem',
                    fontWeight: '400',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontWeight: '400',
                    marginTop: '0.5rem',
                    letterSpacing: '0.5px'
                  }}>
                    {item.subtitle}
                  </div>
                </div>

                {/* Middle Column - Description */}
                <div style={{
                  width: '50%',
                  paddingRight: '2rem'
                }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: isMobile ? '1rem' : '1.125rem',
                    fontWeight: '400',
                    lineHeight: 1.5
                  }}>
                    {item.description}
                  </div>
                </div>

                {/* Right Column - Arrow */}
                <motion.div
                  style={{
                    width: '25%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    transform: expandedItem === item.id ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}
                  animate={{ rotate: expandedItem === item.id ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg
                    width={isMobile ? "28" : "36"}
                    height={isMobile ? "28" : "36"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </motion.div>
              </motion.div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div style={{
                      padding: isMobile ? '2rem 0' : '3rem 0 4rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      {/* Overview */}
                      <div style={{
                        marginBottom: '3rem',
                        maxWidth: '800px'
                      }}>
                        <div style={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '0.75rem',
                          fontWeight: '400',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          marginBottom: '1rem'
                        }}>
                          Overview
                        </div>
                        <p style={{
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: isMobile ? '1rem' : '1.25rem',
                          lineHeight: 1.6,
                          margin: 0,
                          fontWeight: '400'
                        }}>
                          {item.detailedContent.overview}
                        </p>
                      </div>

                      {/* Features Grid */}
                      <div style={{ marginBottom: '3rem' }}>
                        <div style={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '0.75rem',
                          fontWeight: '400',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          marginBottom: '1.5rem'
                        }}>
                          Key Features
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                          gap: '1rem'
                        }}>
                          {item.detailedContent.features.map((feature, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: '400' }}>
                                {feature}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div style={{
                        marginBottom: '3rem',
                        padding: '2rem',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderLeft: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '0.75rem',
                          fontWeight: '400',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          marginBottom: '1rem'
                        }}>
                          Why Choose This
                        </div>
                        <p style={{
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: isMobile ? '0.95rem' : '1.125rem',
                          lineHeight: 1.6,
                          margin: 0,
                          fontWeight: '400'
                        }}>
                          {item.detailedContent.benefits}
                        </p>
                      </div>

                      {/* Stats */}
                      <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '2rem'
                      }}>
                        <span style={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '0.75rem',
                          fontWeight: '400',
                          letterSpacing: '0.5px'
                        }}>
                          {item.detailedContent.stats}
                        </span>
                      </div>

                      {/* Action Button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(item.link);
                        }}
                        style={{
                          width: 'auto',
                          padding: '1rem 2rem',
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '0',
                          fontSize: '0.875rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          letterSpacing: '1px',
                          transition: 'all 0.3s ease'
                        }}
                        whileHover={{ 
                          backgroundColor: 'white',
                          color: 'black',
                          borderColor: 'white'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        EXPLORE {item.title}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </div>
          
        {/* MENURU TEXT WITH MODERN GSAP SCROLL ANIMATION */}
        <div 
          ref={menuruContainerRef}
          style={{
            width: '100%',
            marginTop: '120px',
            marginBottom: '100px',
            padding: '80px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            perspective: '1000px',
            minHeight: isMobile ? '300px' : '700px',
            position: 'relative'
          }}
        >
          <div
            ref={menuruTextRef}
            style={{
              fontSize: isMobile ? '80px' : '490px',
              fontWeight: '400',
              color: 'white',
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: '0.9',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              willChange: 'transform, opacity, filter'
            }}
          >
            MENURU
          </div>
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
          strokeWidth="1.5"
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
