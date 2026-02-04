'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Pastikan firebase sudah diinisialisasi

export default function UpdatePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          photoURL: user.photoURL
        });
      } else {
        setCurrentUser(null);
      }
    });
    
    return () => unsubscribe();
  }, [auth]);

  const updates = [
    {
      id: 1,
      date: 'MAR 20',
      time: '14:30',
      title: 'Quantum UI System',
      category: 'Design System',
      description: 'Implemented atomic design principles with responsive grid system',
      status: 'Live',
      statusColor: '#00DC82',
      progress: 100
    },
    {
      id: 2,
      date: 'MAR 19',
      time: '11:15',
      title: 'Neural Analytics',
      category: 'AI Features',
      description: 'Real-time user behavior prediction engine deployed',
      status: 'Testing',
      statusColor: '#FFB800',
      progress: 85
    },
    {
      id: 3,
      date: 'MAR 18',
      time: '09:45',
      title: 'Zero Latency Sync',
      category: 'Performance',
      description: 'Reduced API response time to under 50ms globally',
      status: 'Deployed',
      statusColor: '#00C2FF',
      progress: 100
    },
    {
      id: 4,
      date: 'MAR 17',
      time: '16:20',
      title: 'Security Matrix v2',
      category: 'Security',
      description: 'Enhanced encryption protocols and biometric verification',
      status: 'Rolling Out',
      statusColor: '#FF6B8B',
      progress: 70
    },
    {
      id: 5,
      date: 'MAR 16',
      time: '13:10',
      title: 'Cloud Infrastructure',
      category: 'DevOps',
      description: 'Migrated to edge computing with 99.99% uptime guarantee',
      status: 'Complete',
      statusColor: '#00DC82',
      progress: 100
    }
  ];

  const notifications = [
    { id: 1, type: 'alert', message: 'System maintenance in 2 hours' },
    { id: 2, type: 'info', message: 'New team member joined' },
    { id: 3, type: 'success', message: 'Update successfully deployed' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      color: '#FFFFFF',
      padding: '40px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Lines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none'
      }} />

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gap: '40px',
        maxWidth: '1600px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Sidebar */}
        <div>
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              marginBottom: '60px',
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '40px',
                background: 'linear-gradient(180deg, #00DC82 0%, #00C2FF 100%)'
              }} />
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                letterSpacing: '-0.5px',
                color: '#FFFFFF'
              }}>
                Menuru
              </h1>
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              paddingLeft: '18px'
            }}>
              Version 3.1.0
            </div>
          </motion.div>

          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '20px',
              marginBottom: '40px'
            }}
          >
            {currentUser ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #00DC82 0%, #00C2FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#000000'
                  }}>
                    {currentUser.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {currentUser.displayName}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.4)'
                    }}>
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(0,220,130,0.05)',
                    border: '1px solid rgba(0,220,130,0.1)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#00DC82'
                    }}>
                      24
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Updates
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(0,194,255,0.05)',
                    border: '1px solid rgba(0,194,255,0.1)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#00C2FF'
                    }}>
                      156
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Active
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: 'rgba(255,255,255,0.4)'
              }}>
                Not logged in
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '20px'
            }}
          >
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '20px'
            }}>
              System Status
            </div>
            
            {[
              { label: 'API Health', value: 99.9, color: '#00DC82' },
              { label: 'Database', value: 100, color: '#00C2FF' },
              { label: 'CDN', value: 99.8, color: '#FFB800' },
              { label: 'Security', value: 100, color: '#00DC82' }
            ].map((stat, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    {stat.label}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: stat.color
                  }}>
                    {stat.value}%
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                    style={{
                      height: '100%',
                      background: stat.color,
                      borderRadius: '2px'
                    }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Main Content - Updates Timeline */}
        <div>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <div>
              <div style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                Development Timeline
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                System Updates
              </h2>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(0,220,130,0.1)',
                border: '1px solid rgba(0,220,130,0.2)',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#00DC82'
              }}>
                {updates.length} Active
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="17" y1="7" x2="7" y2="17"></line>
                  <polyline points="17 17 7 17 7 7"></polyline>
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {/* Vertical Line */}
            <div style={{
              position: 'absolute',
              left: '30px',
              top: '0',
              bottom: '0',
              width: '2px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
            }} />

            <AnimatePresence>
              {updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '32px',
                    position: 'relative'
                  }}
                >
                  {/* Timeline Dot */}
                  <div style={{
                    width: '62px',
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: update.statusColor,
                      position: 'absolute',
                      left: '24px',
                      top: '8px',
                      zIndex: 2
                    }} />
                    <div style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.6)',
                      position: 'absolute',
                      right: '0',
                      top: '4px',
                      textAlign: 'right',
                      lineHeight: '1.2'
                    }}>
                      {update.date}
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.4)'
                      }}>
                        {update.time}
                      </div>
                    </div>
                  </div>

                  {/* Update Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    style={{
                      flex: 1,
                      padding: '24px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '20px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Progress Bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'rgba(255,255,255,0.1)'
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${update.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        style={{
                          height: '100%',
                          background: update.statusColor
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#FFFFFF'
                          }}>
                            {update.title}
                          </h3>
                          <div style={{
                            padding: '4px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.6)'
                          }}>
                            {update.category}
                          </div>
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: 'rgba(255,255,255,0.6)',
                          lineHeight: '1.6',
                          marginBottom: '20px'
                        }}>
                          {update.description}
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ rotate: -45 }}
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke={update.statusColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="17" y1="7" x2="7" y2="17"></line>
                          <polyline points="17 17 7 17 7 7"></polyline>
                        </svg>
                      </motion.div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: update.statusColor
                          }} />
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: update.statusColor
                          }}>
                            {update.status}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.4)'
                        }}>
                          {update.progress}% Complete
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        Source: 
                        <span style={{
                          color: '#FFFFFF',
                          fontWeight: '500'
                        }}>
                          {update.category.replace(/\s+/g, '')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar - Notifications */}
        <div>
          {/* Notifications Header */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              marginBottom: '40px'
            }}
          >
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              Real-time Alerts
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              color: '#FFFFFF'
            }}>
              Notifications
            </h3>
          </motion.div>

          {/* Notification List */}
          <div style={{ marginBottom: '40px' }}>
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    marginBottom: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: notification.type === 'alert' ? '#FFB800' : 
                               notification.type === 'success' ? '#00DC82' : '#00C2FF'
                  }} />
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginLeft: '12px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.8)'
                    }}>
                      {notification.message}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                      whiteSpace: 'nowrap',
                      marginLeft: '12px'
                    }}>
                      5min
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '20px'
            }}>
              Recent Activity
            </div>
            
            {[
              { user: 'Alex Chen', action: 'deployed update', time: '2 min ago' },
              { user: 'Maria Garcia', action: 'reviewed code', time: '15 min ago' },
              { user: 'David Kim', action: 'created feature', time: '1 hour ago' }
            ].map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #00DC82 0%, #00C2FF 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  {activity.user.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    <span style={{ fontWeight: '500', color: '#FFFFFF' }}>{activity.user}</span> {activity.action}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)'
                  }}>
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
