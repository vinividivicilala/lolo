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
  const chatEndRef = useRef(null);
  
  // Admin email yang berhak menjawab
  const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

  useEffect(() => {
    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Custom smooth scroll without Lenis
    const handleWheel = (e) => {
      if (window.innerWidth > 768) {
        e.preventDefault();
        const delta = e.deltaY;
        const scrollAmount = delta * 0.8;
        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    // Show scroll to top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Only add wheel listener on desktop
    if (window.innerWidth > 768) {
      window.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Welcome message
      setMessages([
        {
          id: Date.now(),
          text: "Hello! I'm Farid's support. Please leave your email and message, and I'll get back to you soon!",
          sender: 'admin',
          timestamp: new Date().toISOString()
        }
      ]);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
      if (window.innerWidth > 768) {
        window.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    // Simulate admin typing
    setIsAdminTyping(true);

    // Check if message contains email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailRegex.test(inputMessage);
    const hasTargetEmail = inputMessage.toLowerCase().includes('faridardiansyah061@gmail.com');
    
    // Simulate admin response after 1-2 seconds
    setTimeout(() => {
      let adminResponse = "";
      
      if (hasTargetEmail) {
        adminResponse = "✅ Thank you! I've received your message at faridardiansyah061@gmail.com. I'll respond within 24 hours. Is there anything specific you'd like to discuss about the profile or projects?";
      } else if (hasEmail) {
        adminResponse = "📧 Thanks for sharing your email! Please note that priority responses are given to faridardiansyah061@gmail.com. Feel free to ask me anything about my portfolio!";
      } else if (inputMessage.toLowerCase().includes('hello') || inputMessage.toLowerCase().includes('hi')) {
        adminResponse = "👋 Hello there! How can I help you today? Feel free to ask about my projects, experience, or leave your email for a detailed response!";
      } else if (inputMessage.toLowerCase().includes('project')) {
        adminResponse = "🎨 Great question! You can check out my projects in the table above. Each one represents a unique collaboration. Would you like more details about any specific project?";
      } else if (inputMessage.toLowerCase().includes('interview')) {
        adminResponse = "💼 I'd love to discuss interview opportunities! Please leave your email (faridardiansyah061@gmail.com) and I'll get back to you promptly!";
      } else {
        adminResponse = "💬 Thanks for your message! For a quicker response, please use faridardiansyah061@gmail.com. Meanwhile, feel free to explore my portfolio above!";
      }
      
      const adminMessage = {
        id: Date.now() + 1,
        text: adminResponse,
        sender: 'admin',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, adminMessage]);
      setIsAdminTyping(false);
    }, 1500);
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
          {/* Back button */}
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

          {/* Breadcrumb: Home > Profile */}
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

      {/* CHAT BUTTON - Floating action button */}
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

      {/* CHAT WIDGET - Left side */}
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
              width: isMobile ? 'calc(100% - 2rem)' : '380px',
              height: '500px',
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
                <span style={{ color: 'white', fontWeight: '500' }}>Live Chat Support</span>
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
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: msg.sender === 'user' ? '#fff' : '#2a2a2a',
                    color: msg.sender === 'user' ? '#000' : '#fff'
                  }}>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {msg.sender === 'user' ? 'You' : 'Farid'}
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
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Farid</div>
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
                  placeholder="Type your message... (include email for response)"
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
              <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                Only messages to faridardiansyah061@gmail.com get priority response
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: isMobile ? '0 1.5rem' : '0 3rem'
      }}>

        {/* HERO */}
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

        {/* DESC */}
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

        {/* LINE */}
        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          marginBottom: '1rem'
        }} />

        {/* TABLE */}
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
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .typing-dot {
          animation: typing 1.4s infinite;
          animation-fill-mode: both;
          font-size: 20px;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
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
