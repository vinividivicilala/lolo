'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function UpdatePage() {
  const [currentUser, setCurrentUser] = useState('John Doe');
  const [notificationCount, setNotificationCount] = useState(3);
  
  const updates = [
    {
      id: 1,
      date: '2024-03-20',
      title: 'UI Revolution v3.0',
      category: 'Design Update',
      description: 'Complete overhaul of user interface with gradient themes, micro-interactions, and enhanced accessibility features.',
      status: 'Live',
      statusColor: '#10B981',
      source: 'Design Team',
      priority: 'High',
      userCount: 1500
    },
    {
      id: 2,
      date: '2024-03-18',
      title: 'Performance Boost',
      category: 'Backend',
      description: 'Server optimization reducing load times by 65%. Implemented advanced caching and CDN integration.',
      status: 'Deployed',
      statusColor: '#3B82F6',
      source: 'DevOps',
      priority: 'Critical',
      userCount: 2300
    },
    {
      id: 3,
      date: '2024-03-15',
      title: 'Mobile Experience',
      category: 'Frontend',
      description: 'Redesigned mobile interface with gesture controls, offline capabilities, and PWA support.',
      status: 'Testing',
      statusColor: '#F59E0B',
      source: 'Mobile Team',
      priority: 'Medium',
      userCount: 890
    },
    {
      id: 4,
      date: '2024-03-10',
      title: 'Security Enhancements',
      category: 'Security',
      description: 'Added end-to-end encryption, 2FA, and real-time threat detection systems.',
      status: 'Completed',
      statusColor: '#8B5CF6',
      source: 'Security Team',
      priority: 'Critical',
      userCount: 3100
    }
  ];

  const messages = [
    { id: 1, user: 'Alex Chen', text: 'Loving the new update!', time: '2 min ago', color: '#EC4899' },
    { id: 2, user: 'Maria Garcia', text: 'Performance is amazing now', time: '15 min ago', color: '#10B981' },
    { id: 3, user: 'David Kim', text: 'When is the next feature drop?', time: '1 hour ago', color: '#3B82F6' },
  ];

  const userStats = {
    active: 3421,
    newToday: 127,
    online: 2894
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      color: 'white',
      padding: '2rem',
      fontFamily: 'Helvetica, Arial, sans-serif',
      backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.1) 0%, transparent 55%)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: '24px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.h1 
            style={{
              fontSize: '3.5rem',
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '900',
              letterSpacing: '-1px'
            }}
            whileHover={{ scale: 1.05 }}
          >
            Menuru
          </motion.h1>
          
          {/* NORTH WEST ARROW SVG */}
          <motion.div
            whileHover={{ rotate: -45 }}
            style={{
              padding: '0.8rem',
              background: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(78,205,196,0.2))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="url(#arrowGradient)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B6B" />
                  <stop offset="100%" stopColor="#4ECDC4" />
                </linearGradient>
              </defs>
              <line x1="17" y1="7" x2="7" y2="17"></line>
              <polyline points="17 17 7 17 7 7"></polyline>
            </svg>
          </motion.div>
        </div>

        {/* User Info & Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <motion.div 
            style={{
              position: 'relative',
              cursor: 'pointer'
            }}
            whileTap={{ scale: 0.9 }}
          >
            <div style={{
              padding: '0.8rem',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            {notificationCount > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'linear-gradient(45deg, #FF6B6B, #EC4899)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {notificationCount}
              </motion.div>
            )}
          </motion.div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1.2rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              JD
            </div>
            <div>
              <div style={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #F59E0B, #EF4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {currentUser}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Logged In</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {Object.entries(userStats).map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              padding: '1.5rem',
              background: `linear-gradient(135deg, ${index === 0 ? 'rgba(16, 185, 129, 0.1)' : index === 1 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)'})`,
              borderRadius: '20px',
              border: `1px solid ${index === 0 ? 'rgba(16, 185, 129, 0.3)' : index === 1 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.05 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                  {value.toLocaleString()}
                </div>
              </div>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${index === 0 ? '#10B981' : index === 1 ? '#3B82F6' : '#8B5CF6'})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {index === 0 ? '👥' : index === 1 ? '✨' : '⚡'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem'
      }}>
        {/* Updates Timeline */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '2rem',
              background: 'linear-gradient(45deg, #F59E0B, #EF4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              Recent Updates
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.8rem 1.5rem',
                background: 'linear-gradient(45deg, #EC4899, #8B5CF6)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              View All
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="11" y2="6"></line>
                <polyline points="7 6 11 6 11 10"></polyline>
              </svg>
            </motion.button>
          </div>

          {updates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                padding: '1.5rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      padding: '0.3rem 0.8rem',
                      background: `rgba(${parseInt(update.statusColor.slice(1, 3), 16)}, ${parseInt(update.statusColor.slice(3, 5), 16)}, ${parseInt(update.statusColor.slice(5, 7), 16)}, 0.2)`,
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: update.statusColor,
                      border: `1px solid ${update.statusColor}40`
                    }}>
                      {update.status}
                    </div>
                    <div style={{
                      padding: '0.3rem 0.8rem',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      {update.category}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#F3F4F6' }}>
                    {update.title}
                  </h3>
                  <p style={{ color: '#9CA3AF', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {update.description}
                  </p>
                </div>
                <motion.div whileHover={{ rotate: -45 }}>
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={update.statusColor}
                    strokeWidth="2"
                  >
                    <line x1="17" y1="7" x2="7" y2="17"></line>
                    <polyline points="17 17 7 17 7 7"></polyline>
                  </svg>
                </motion.div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ opacity: 0.7 }}>📅</div>
                    <span style={{ color: '#D1D5DB' }}>{update.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ opacity: 0.7 }}>👥</div>
                    <span style={{ color: '#D1D5DB' }}>{update.userCount} users</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ opacity: 0.7 }}>⚡</div>
                    <span style={{ 
                      color: update.priority === 'Critical' ? '#EF4444' : 
                             update.priority === 'High' ? '#F59E0B' : '#3B82F6',
                      fontWeight: 'bold'
                    }}>
                      {update.priority}
                    </span>
                  </div>
                </div>
                <div style={{ 
                  padding: '0.4rem 0.8rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#9CA3AF'
                }}>
                  Source: <span style={{ color: update.statusColor, fontWeight: 'bold' }}>{update.source}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Messages & Activity */}
        <div>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Recent Messages
            </h3>
            
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  borderLeft: `4px solid ${message.color}`
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: `linear-gradient(135deg, ${message.color}40, ${message.color}20)`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: message.color
                    }}>
                      {message.user.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#F3F4F6' }}>{message.user}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{message.time}</div>
                    </div>
                  </div>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={message.color}
                    strokeWidth="2"
                  >
                    <line x1="17" y1="7" x2="7" y2="17"></line>
                    <polyline points="17 17 7 17 7 7"></polyline>
                  </svg>
                </div>
                <p style={{ color: '#D1D5DB', marginLeft: '3.2rem' }}>{message.text}</p>
              </motion.div>
            ))}

            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                textAlign: 'center',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#3B82F6' }}>Load More Messages</span>
                <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#F3F4F6' }}>
              Quick Actions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {['New Update', 'Invite Team', 'Settings', 'Export Data'].map((action, index) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '0.8rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem'
                  }}
                >
                  <span>{action}</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="17" y1="7" x2="7" y2="17"></line>
                    <polyline points="17 17 7 17 7 7"></polyline>
                  </svg>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.9rem',
        color: '#9CA3AF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span>Last Updated: Today at 14:30</span>
          <div style={{
            width: '6px',
            height: '6px',
            background: '#10B981',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
        </div>
        <div>© 2024 Menuru Platform. All updates are real-time.</div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
