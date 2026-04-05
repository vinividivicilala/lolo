'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const chatEndRef = useRef(null);
  
  const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
  const ADMIN_PASSWORD = "admin123"; // Ganti dengan password yang lebih aman

  useEffect(() => {
    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('chatUser');
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    } else {
      // Auto login with guest name
      const guestName = `Guest_${Math.floor(Math.random() * 1000)}`;
      const newUser = {
        id: Date.now(),
        name: guestName,
        email: null,
        isAdmin: false
      };
      localStorage.setItem('chatUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
    }

    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (adminLoggedIn === 'true') {
      setIsAdminMode(true);
      loadAllUsers();
    }

    // Load messages
    loadMessages();

    // Show scroll to top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadMessages = () => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: Date.now(),
          text: "Welcome to live chat! Please login or continue as guest. Admin: faridardiansyah061@gmail.com",
          sender: 'admin',
          userId: 'system',
          userName: 'System',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const loadAllUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('allChatUsers') || '[]');
    setUsers(allUsers);
  };

  const saveUser = (user) => {
    const allUsers = JSON.parse(localStorage.getItem('allChatUsers') || '[]');
    const existingUser = allUsers.find(u => u.id === user.id);
    if (!existingUser) {
      allUsers.push(user);
      localStorage.setItem('allChatUsers', JSON.stringify(allUsers));
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      localStorage.setItem('adminLoggedIn', 'true');
      loadAllUsers();
      
      // Set current user as admin
      const adminUser = {
        id: 'admin',
        name: 'Farid Ardiansyah',
        email: ADMIN_EMAIL,
        isAdmin: true
      };
      setCurrentUser(adminUser);
      localStorage.setItem('chatUser', JSON.stringify(adminUser));
    } else {
      alert("Wrong password!");
    }
  };

  const handleUserLogin = (email, name) => {
    const user = {
      id: Date.now(),
      name: name,
      email: email,
      isAdmin: email === ADMIN_EMAIL
    };
    
    setCurrentUser(user);
    localStorage.setItem('chatUser', JSON.stringify(user));
    saveUser(user);
    
    // Add system message
    const systemMessage = {
      id: Date.now(),
      text: `${name} has joined the chat`,
      sender: 'system',
      userId: 'system',
      userName: 'System',
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, systemMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
  };

  const handleLogout = () => {
    localStorage.removeItem('chatUser');
    setCurrentUser(null);
    setIsAdminMode(false);
    localStorage.removeItem('adminLoggedIn');
    window.location.reload();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!currentUser) {
      alert("Please login first!");
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: currentUser.isAdmin ? 'admin' : 'user',
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    setInputMessage("");

    // Auto response for non-admin users
    if (!currentUser.isAdmin) {
      setIsAdminTyping(true);
      
      setTimeout(() => {
        let adminResponse = "";
        const hasTargetEmail = inputMessage.toLowerCase().includes('faridardiansyah061@gmail.com');
        
        if (hasTargetEmail) {
          adminResponse = `✅ Hi ${currentUser.name}! Thanks for reaching out to faridardiansyah061@gmail.com. I'll respond within 24 hours.`;
        } else if (inputMessage.toLowerCase().includes('hello') || inputMessage.toLowerCase().includes('hi')) {
          adminResponse = `👋 Hello ${currentUser.name}! How can I help you today?`;
        } else {
          adminResponse = `💬 Thanks for your message ${currentUser.name}! For priority response, please email faridardiansyah061@gmail.com`;
        }
        
        const adminMessage = {
          id: Date.now() + 1,
          text: adminResponse,
          sender: 'admin',
          userId: 'admin',
          userName: 'Farid Ardiansyah',
          userEmail: ADMIN_EMAIL,
          timestamp: new Date().toISOString()
        };
        
        const finalMessages = [...updatedMessages, adminMessage];
        setMessages(finalMessages);
        localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
        setIsAdminTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                {currentUser && !isAdminMode && (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                    ({currentUser.name})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!currentUser && !isAdminMode && (
                  <motion.button
                    onClick={() => {
                      const email = prompt("Enter your email (optional):");
                      const name = prompt("Enter your name:");
                      if (name) handleUserLogin(email, name);
                    }}
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
                    Login
                  </motion.button>
                )}
                {!isAdminMode && currentUser?.email !== ADMIN_EMAIL && (
                  <motion.button
                    onClick={() => setShowAdminLogin(true)}
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
                    Admin
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

            {/* Admin Login Modal */}
            {showAdminLogin && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  backgroundColor: '#2a2a2a',
                  padding: '2rem',
                  borderRadius: '12px',
                  width: '300px'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '1rem' }}>Admin Login</h3>
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: '#1a1a1a',
                      color: 'white'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleAdminLogin}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setShowAdminLogin(false)}
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
                      Cancel
                    </button>
                  </div>
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
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' && msg.userId === currentUser?.id ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: msg.sender === 'admin' ? '#2a2a2a' : 
                                   msg.sender === 'system' ? 'rgba(255,255,255,0.1)' : '#fff',
                    color: msg.sender === 'user' ? '#000' : '#fff'
                  }}>
                    <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem', opacity: 0.7 }}>
                      {msg.userName}
                      {msg.userEmail && ` (${msg.userEmail})`}
                    </div>
                    <div style={{ fontSize: '0.9rem', wordWrap: 'break-word' }}>
                      {msg.text}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      marginTop: '0.25rem',
                      opacity: 0.6,
                      textAlign: 'right'
                    }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isAdminTyping && (
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
                    <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Farid Ardiansyah</div>
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
                    💬 Admin: faridardiansyah061@gmail.com
                  </div>
                )}
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
