'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  where,
  getDoc
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { motion, AnimatePresence } from "framer-motion";

// Firebase Configuration
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
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export default function UpdatePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    category: 'feature',
    status: 'pending'
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          photoURL: user.photoURL
        });
        
        // Load updates and notifications
        loadUpdates();
        loadNotifications();
      } else {
        setCurrentUser(null);
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [router]);

  const loadUpdates = () => {
    const updatesQuery = query(
      collection(db, "updates"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(updatesQuery, (snapshot) => {
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setUpdates(updatesData);
    });

    return unsubscribe;
  };

  const loadNotifications = () => {
    const notificationsQuery = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setNotifications(notificationsData);
    });

    return unsubscribe;
  };

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser || !newUpdate.title.trim()) return;

    try {
      await addDoc(collection(db, "updates"), {
        title: newUpdate.title,
        description: newUpdate.description,
        category: newUpdate.category,
        status: newUpdate.status,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName,
        createdAt: serverTimestamp(),
        progress: newUpdate.status === 'completed' ? 100 : 
                 newUpdate.status === 'in-progress' ? 50 : 0
      });

      // Create notification
      await addDoc(collection(db, "notifications"), {
        type: 'info',
        message: `New update created: ${newUpdate.title}`,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        read: false
      });

      setNewUpdate({
        title: '',
        description: '',
        category: 'feature',
        status: 'pending'
      });

    } catch (error) {
      console.error("Error creating update:", error);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    try {
      await deleteDoc(doc(db, "updates", updateId));
    } catch (error) {
      console.error("Error deleting update:", error);
    }
  };

  const handleUpdateStatus = async (updateId, newStatus) => {
    try {
      const progressMap = {
        'pending': 0,
        'in-progress': 50,
        'completed': 100
      };

      await updateDoc(doc(db, "updates", updateId), {
        status: newStatus,
        progress: progressMap[newStatus],
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#00DC82';
      case 'in-progress': return '#00C2FF';
      case 'pending': return '#FFB800';
      default: return '#666';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'feature': return '#8B5CF6';
      case 'bug': return '#EF4444';
      case 'improvement': return '#10B981';
      case 'security': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Helvetica, Arial, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      color: '#FFFFFF',
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

      {/* Main Container */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '60px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
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
              background: 'rgba(255,255,255,0.05)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              Version 3.1.0
            </div>
          </div>

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </motion.button>
              
              {notifications.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'linear-gradient(45deg, #FF6B6B, #EC4899)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {notifications.length}
                </motion.div>
              )}
            </div>

            {/* User Profile */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #00DC82 0%, #00C2FF 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000'
              }}>
                {currentUser.displayName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '2px'
                }}>
                  {currentUser.displayName}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)'
                }}>
                  {currentUser.email}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                style={{
                  marginLeft: '8px',
                  padding: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '40px'
        }}>
          {/* Left Column - Updates */}
          <div>
            {/* Create Update Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                marginBottom: '40px'
              }}
            >
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px',
                color: '#FFFFFF'
              }}>
                Create New Update
              </h3>
              
              <form onSubmit={handleCreateUpdate}>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Update title"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    placeholder="Description"
                    value={newUpdate.description}
                    onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '6px'
                    }}>
                      Category
                    </label>
                    <select
                      value={newUpdate.category}
                      onChange={(e) => setNewUpdate({...newUpdate, category: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="feature">Feature</option>
                      <option value="bug">Bug Fix</option>
                      <option value="improvement">Improvement</option>
                      <option value="security">Security</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '6px'
                    }}>
                      Status
                    </label>
                    <select
                      value={newUpdate.status}
                      onChange={(e) => setNewUpdate({...newUpdate, status: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #00DC82 0%, #00C2FF 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000000',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Create Update
                </motion.button>
              </form>
            </motion.div>

            {/* Updates List */}
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#FFFFFF'
              }}>
                Recent Updates
              </h2>
              
              <AnimatePresence>
                {updates.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '24px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '20px',
                      marginBottom: '16px',
                      position: 'relative'
                    }}
                  >
                    {/* Progress Bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '20px 20px 0 0'
                    }}>
                      <div style={{
                        width: `${update.progress || 0}%`,
                        height: '100%',
                        background: getStatusColor(update.status),
                        borderRadius: '20px 20px 0 0',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
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
                            background: getCategoryColor(update.category) + '20',
                            border: `1px solid ${getCategoryColor(update.category)}40`,
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: getCategoryColor(update.category),
                            textTransform: 'capitalize'
                          }}>
                            {update.category}
                          </div>
                        </div>
                        
                        <p style={{
                          fontSize: '14px',
                          color: 'rgba(255,255,255,0.6)',
                          lineHeight: '1.6',
                          marginBottom: '16px'
                        }}>
                          {update.description}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* North West Arrow */}
                        <motion.div
                          whileHover={{ rotate: -45 }}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
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
                            stroke={getStatusColor(update.status)}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="17" y1="7" x2="7" y2="17"></line>
                            <polyline points="17 17 7 17 7 7"></polyline>
                          </svg>
                        </motion.div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteUpdate(update.id)}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#EF4444'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: getStatusColor(update.status)
                          }} />
                          <span style={{
                            color: getStatusColor(update.status),
                            fontWeight: '500',
                            textTransform: 'capitalize'
                          }}>
                            {update.status}
                          </span>
                        </div>
                        
                        <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                          by {update.createdByName}
                        </div>
                        
                        <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {formatDate(update.createdAt)}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {['pending', 'in-progress', 'completed'].map((status) => (
                          <motion.button
                            key={status}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(update.id, status)}
                            style={{
                              padding: '4px 12px',
                              background: update.status === status 
                                ? getStatusColor(status) 
                                : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${getStatusColor(status)}40`,
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: update.status === status ? '#000000' : getStatusColor(status),
                              cursor: 'pointer',
                              textTransform: 'capitalize'
                            }}
                          >
                            {status}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Notifications & Stats */}
          <div>
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                marginBottom: '40px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#FFFFFF'
                }}>
                  Notifications
                </h3>
                
                {notifications.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      notifications.forEach(notif => handleMarkAsRead(notif.id));
                    }}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer'
                    }}
                  >
                    Mark all as read
                  </motion.button>
                )}
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <AnimatePresence>
                  {notifications.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 0',
                      color: 'rgba(255,255,255,0.4)'
                    }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          padding: '16px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          marginBottom: '8px',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          background: notification.type === 'alert' ? '#FFB800' : 
                                   notification.type === 'success' ? '#00DC82' : '#00C2FF',
                          borderRadius: '12px 0 0 12px'
                        }} />
                        
                        <div style={{
                          marginLeft: '12px',
                          fontSize: '14px',
                          color: 'rgba(255,255,255,0.8)'
                        }}>
                          {notification.message}
                        </div>
                        
                        <div style={{
                          marginLeft: '12px',
                          marginTop: '4px',
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.4)'
                        }}>
                          {formatDate(notification.createdAt)}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Stats */}
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
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px',
                color: '#FFFFFF'
              }}>
                Statistics
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                {[
                  { label: 'Total Updates', value: updates.length, color: '#00DC82' },
                  { label: 'Pending', value: updates.filter(u => u.status === 'pending').length, color: '#FFB800' },
                  { label: 'In Progress', value: updates.filter(u => u.status === 'in-progress').length, color: '#00C2FF' },
                  { label: 'Completed', value: updates.filter(u => u.status === 'completed').length, color: '#8B5CF6' }
                ].map((stat, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${stat.color}20`,
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: stat.color,
                      marginBottom: '4px'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* User Info */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #00DC82 0%, #00C2FF 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  {currentUser.displayName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF'
                  }}>
                    {currentUser.displayName}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)'
                  }}>
                    {currentUser.email}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    marginTop: '2px'
                  }}>
                    Last login: Today
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
