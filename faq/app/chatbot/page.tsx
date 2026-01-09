'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: 1, text: "Halo! Saya Menuru, asisten chatbot dari Note. Ada yang bisa saya bantu?", sender: 'bot', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate bot response after delay
    setTimeout(() => {
      const botResponses = [
        "Saya memahami pertanyaan Anda. Sebagai asisten dari Note, saya bisa membantu Anda dengan berbagai informasi.",
        "Terima kasih atas pertanyaannya. Sistem saya sedang memproses informasi terkini untuk memberikan jawaban terbaik.",
        "Berdasarkan data yang saya miliki, saya dapat memberikan panduan tentang penggunaan platform Note.",
        "Sebagai chatbot yang terintegrasi dengan akun user, saya dapat memberikan respon real-time untuk kebutuhan Anda.",
        "Pertanyaan yang bagus! Saya akan mencari informasi terbaru untuk membantu Anda."
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '2rem',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: '4rem'
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
          marginTop: '3rem',
          marginLeft: '2rem',
          position: 'relative'
        }}
      >
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
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
            fontSize: '1.5rem',
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
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{
              fontSize: '0.9rem',
              color: '#b0b0b0',
              fontWeight: '300'
            }}>
              Online
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              fontSize: '0.8rem',
              color: '#888',
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}
          >
            Asisten chatbot dari Note - Akun user chatbot untuk menjawab pertanyaan secara otomatis dan realtime
          </motion.div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          maxWidth: '800px',
          margin: '3rem auto',
          backgroundColor: '#111',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid #333',
          height: '500px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '1rem',
          paddingRight: '0.5rem'
        }}>
          {messages.map((message) => (
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
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  backgroundColor: message.sender === 'user' ? '#3a3a3a' : '#2a2a2a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {message.sender === 'user' ? 'YOU' : 'AI'}
                </div>
                <div style={{
                  maxWidth: '70%',
                  backgroundColor: message.sender === 'user' ? '#2563eb' : '#333',
                  padding: '0.75rem 1rem',
                  borderRadius: '18px',
                  borderTopLeftRadius: message.sender === 'user' ? '18px' : '5px',
                  borderTopRightRadius: message.sender === 'user' ? '5px' : '18px'
                }}>
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                    {message.text}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#aaa',
                    marginTop: '0.5rem',
                    textAlign: 'right'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
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
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                backgroundColor: '#2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                AI
              </div>
              <div style={{
                backgroundColor: '#333',
                padding: '0.75rem 1rem',
                borderRadius: '18px',
                borderTopLeftRadius: '5px'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50'
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50'
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50'
                    }}
                  />
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
          paddingTop: '1rem'
        }}>
          <div style={{
            flex: 1,
            backgroundColor: '#222',
            borderRadius: '25px',
            padding: '0.75rem 1.5rem',
            border: '1px solid #444',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan Anda di sini..."
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                maxHeight: '120px'
              }}
              rows="1"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={isLoading || inputText.trim() === ''}
            style={{
              backgroundColor: inputText.trim() === '' ? '#333' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() === '' ? 'not-allowed' : 'pointer',
              opacity: inputText.trim() === '' ? 0.6 : 1
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
          </motion.button>
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
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #222;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
