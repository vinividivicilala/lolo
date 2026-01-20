'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  where,
  getDocs
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

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
let db = null;
let auth = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'announcement' | 'alert' | 'update' | 'comment' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  senderId: string;
  senderName: string;
  senderEmail?: string;
  recipientType: 'all' | 'specific' | 'email_only' | 'app_only';
  recipientIds?: string[];
  recipientEmails?: string[];
  isRead: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
  icon?: string;
  color?: string;
}

export default function NotificationsPage(): React.JSX.Element {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system' | 'announcement' | 'personal'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Admin email yang diizinkan
  const ADMIN_EMAILS = [
    'faridardiansyah061@gmail.com',
    // Tambahkan email admin lainnya di sini
  ];

  // Check if user is admin
  const checkIsAdmin = (email: string | null) => {
    return email && ADMIN_EMAILS.includes(email);
  };

  // Load user data dan cek admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = checkIsAdmin(currentUser.email);
        setIsAdmin(adminStatus);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load notifications
  useEffect(() => {
    if (!db || !user) return;

    setIsLoading(true);
    const notificationsRef = collection(db, 'notifications');
    
    // Query berdasarkan user role
    let q;
    if (isAdmin) {
      // Admin bisa lihat semua notifikasi
      q = query(notificationsRef, orderBy('createdAt', 'desc'));
    } else {
      // Regular user hanya lihat notifikasi yang ditujukan kepada mereka
      q = query(
        notificationsRef,
        where('recipientType', 'in', ['all', 'app_only']),
        orderBy('createdAt', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: Notification[] = [];
      let unread = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filter notifikasi untuk regular users
        if (!isAdmin) {
          // Cek jika notifikasi untuk user tertentu
          if (data.recipientType === 'specific') {
            const recipientIds = data.recipientIds || [];
            if (!recipientIds.includes(user.uid)) {
              return; // Skip jika user tidak termasuk
            }
          }
          
          // Cek jika notifikasi email only
          if (data.recipientType === 'email_only') {
            return; // Skip email only untuk regular users di app
          }
        }
        
        const notification = {
          id: doc.id,
          ...data
        } as Notification;
        
        notificationsData.push(notification);
        
        // Hitung unread untuk user ini
        if (notification.recipientType === 'specific') {
          // Untuk specific recipients, cek di userReads
          const userReads = data.userReads || {};
          if (!userReads[user.uid]) {
            unread++;
          }
        } else if (!notification.isRead) {
          unread++;
        }
      });
      
      setNotifications(notificationsData);
      setUnreadCount(unread);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading notifications:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, user, isAdmin]);

  // Filter notifications berdasarkan tab aktif
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') {
      if (notification.recipientType === 'specific') {
        const userReads = (notification as any).userReads || {};
        return !userReads[user?.uid];
      }
      return !notification.isRead;
    }
    if (activeTab === 'system') return notification.type === 'system';
    if (activeTab === 'announcement') return notification.type === 'announcement';
    if (activeTab === 'personal') return notification.type === 'personal';
    return true;
  });

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user || !db) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationDoc = await getDocs(query(collection(db, 'notifications'), where('__name__', '==', notificationId)));
      
      if (!notificationDoc.empty) {
        const notificationData = notificationDoc.docs[0].data();
        
        if (notificationData.recipientType === 'specific') {
          // Update hanya untuk specific recipients
          const userReads = notificationData.userReads || {};
          userReads[user.uid] = true;
          await updateDoc(notificationRef, { userReads });
        } else {
          // Untuk all/app_only, mark as read secara umum
          await updateDoc(notificationRef, { isRead: true });
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user || !db) return;
    
    try {
      const updatePromises = filteredNotifications.map(async (notification) => {
        const notificationRef = doc(db, 'notifications', notification.id);
        
        if (notification.recipientType === 'specific') {
          const userReads = (notification as any).userReads || {};
          userReads[user.uid] = true;
          await updateDoc(notificationRef, { userReads });
        } else if (!notification.isRead) {
          await updateDoc(notificationRef, { isRead: true });
        }
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification (admin only)
  const deleteNotification = async (notificationId: string) => {
    if (!db || !isAdmin) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isDeleted: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system': return '🔄';
      case 'announcement': return '📢';
      case 'alert': return '⚠️';
      case 'update': return '🆕';
      case 'comment': return '💬';
      case 'personal': return '👤';
      default: return '📌';
    }
  };

  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#FF4757';
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA502';
      case 'low': return '#2ED573';
      default: return '#747D8C';
    }
  };

  // Format date
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Open notification detail
  const openNotificationDetail = async (notification: Notification) => {
    setSelectedNotification(notification);
    await markAsRead(notification.id);
  };

  // Close notification detail
  const closeNotificationDetail = () => {
    setSelectedNotification(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '1rem 2rem',
        backgroundColor: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.button
            onClick={() => router.push('/')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ←
          </motion.button>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            margin: 0
          }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: '#FF4757',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: '700',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px'
            }}>
              {unreadCount} new
            </span>
          )}
          {isAdmin && (
            <span style={{
              backgroundColor: '#00FF00',
              color: 'black',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              marginLeft: '0.5rem'
            }}>
              ADMIN
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAdmin && (
            <motion.button
              onClick={() => router.push('/notifications/create')}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: '#0050B7',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              whileHover={{ scale: 1.05, backgroundColor: '#0066CC' }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Notification
            </motion.button>
          )}
          
          {unreadCount > 0 && (
            <motion.button
              onClick={markAllAsRead}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              Mark All Read
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        paddingTop: '80px',
        paddingBottom: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Admin Info Banner */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              margin: '1rem 2rem',
              padding: '1rem',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#00FF00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'black',
              fontWeight: 'bold'
            }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#00FF00' }}>
                Admin Mode Activated
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                You can create and manage all notifications
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          padding: '1.5rem 2rem',
          overflowX: 'auto',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {['all', 'unread', 'system', 'announcement', 'personal'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '0.6rem 1.5rem',
                backgroundColor: activeTab === tab ? '#0050B7' : 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'unread' && unreadCount > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  backgroundColor: '#FF4757',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px'
                }}>
                  {unreadCount}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{ padding: '2rem' }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px'
            }}>
              <div style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1.2rem'
              }}>
                Loading notifications...
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
              gap: '1rem'
            }}>
              <div style={{
                fontSize: '3rem',
                opacity: 0.3
              }}>
                {activeTab === 'unread' ? '📭' : '📋'}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1.2rem',
                textAlign: 'center'
              }}>
                {activeTab === 'unread' 
                  ? 'No unread notifications' 
                  : 'No notifications yet'}
              </div>
              {isAdmin && activeTab !== 'unread' && (
                <motion.button
                  onClick={() => router.push('/notifications/create')}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: '#0050B7',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create First Notification
                </motion.button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {filteredNotifications.map((notification, index) => {
                const isRead = notification.recipientType === 'specific' 
                  ? (notification as any).userReads?.[user?.uid] 
                  : notification.isRead;
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      backgroundColor: isRead 
                        ? 'rgba(255,255,255,0.03)' 
                        : 'rgba(0, 80, 183, 0.1)',
                      borderRadius: '12px',
                      padding: '1.2rem',
                      cursor: 'pointer',
                      border: `1px solid ${isRead 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0, 80, 183, 0.3)'}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => openNotificationDetail(notification)}
                    whileHover={{ 
                      backgroundColor: isRead 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0, 80, 183, 0.15)' 
                    }}
                  >
                    {/* Unread indicator */}
                    {!isRead && (
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        top: '0',
                        bottom: '0',
                        width: '4px',
                        backgroundColor: getPriorityColor(notification.priority),
                        borderTopLeftRadius: '12px',
                        borderBottomLeftRadius: '12px'
                      }} />
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start'
                    }}>
                      {/* Notification Icon */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: notification.color || 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0
                      }}>
                        {notification.icon || getNotificationIcon(notification.type)}
                      </div>

                      {/* Notification Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem'
                        }}>
                          <div>
                            <h3 style={{
                              margin: '0 0 0.3rem 0',
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              color: 'white'
                            }}>
                              {notification.title}
                            </h3>
                            <div style={{
                              display: 'flex',
                              gap: '1rem',
                              alignItems: 'center',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.6)'
                              }}>
                                From: {notification.senderName}
                                {isAdmin && notification.senderEmail && ` (${notification.senderEmail})`}
                              </span>
                              <span style={{
                                fontSize: '0.8rem',
                                padding: '0.1rem 0.5rem',
                                backgroundColor: getPriorityColor(notification.priority),
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: '600'
                              }}>
                                {notification.priority.toUpperCase()}
                              </span>
                              <span style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.6)'
                              }}>
                                {notification.type.toUpperCase()}
                              </span>
                              {notification.recipientType !== 'all' && isAdmin && (
                                <span style={{
                                  fontSize: '0.8rem',
                                  color: '#FFA502'
                                }}>
                                  {notification.recipientType.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '0.5rem'
                          }}>
                            <span style={{
                              fontSize: '0.8rem',
                              color: 'rgba(255,255,255,0.5)'
                            }}>
                              {formatDate(notification.createdAt)}
                            </span>
                            
                            {/* Action buttons */}
                            <div style={{
                              display: 'flex',
                              gap: '0.5rem'
                            }}>
                              {!isRead && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  ✓
                                </motion.button>
                              )}
                              
                              {isAdmin && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 71, 87, 0.2)',
                                    border: 'none',
                                    color: '#FF4757',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  ×
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p style={{
                          margin: '0',
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.95rem',
                          lineHeight: 1.5
                        }}>
                          {notification.message.length > 150
                            ? `${notification.message.substring(0, 150)}...`
                            : notification.message}
                        </p>
                        
                        {notification.actionUrl && (
                          <div style={{ marginTop: '0.8rem' }}>
                            <motion.a
                              href={notification.actionUrl}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#00FF00',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                textDecoration: 'none'
                              }}
                              whileHover={{ x: 5 }}
                            >
                              View Details
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14"/>
                                <path d="m12 5 7 7-7 7"/>
                              </svg>
                            </motion.a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          boxSizing: 'border-box'
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: selectedNotification.color || 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem'
                }}>
                  {selectedNotification.icon || getNotificationIcon(selectedNotification.type)}
                </div>
                <div>
                  <h2 style={{
                    margin: '0 0 0.3rem 0',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {selectedNotification.title}
                  </h2>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      From: {selectedNotification.senderName}
                      {isAdmin && selectedNotification.senderEmail && ` (${selectedNotification.senderEmail})`}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      padding: '0.2rem 0.6rem',
                      backgroundColor: getPriorityColor(selectedNotification.priority),
                      color: 'white',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      {selectedNotification.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={closeNotificationDetail}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Content */}
            <div style={{
              flex: 1,
              padding: '2rem',
              overflowY: 'auto'
            }}>
              <div style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '12px',
                borderLeft: '4px solid' + getPriorityColor(selectedNotification.priority)
              }}>
                <p style={{
                  margin: 0,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line'
                }}>
                  {selectedNotification.message}
                </p>
              </div>

              {/* Notification Metadata */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '0.3rem'
                  }}>
                    Type
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {selectedNotification.type.toUpperCase()}
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '0.3rem'
                  }}>
                    Priority
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: getPriorityColor(selectedNotification.priority)
                  }}>
                    {selectedNotification.priority.toUpperCase()}
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '0.3rem'
                  }}>
                    Sent To
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {selectedNotification.recipientType === 'all' && 'All Users'}
                    {selectedNotification.recipientType === 'specific' && 'Specific Users'}
                    {selectedNotification.recipientType === 'email_only' && 'Email Subscribers'}
                    {selectedNotification.recipientType === 'app_only' && 'App Users Only'}
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '0.3rem'
                  }}>
                    Date Sent
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {formatDate(selectedNotification.createdAt)}
                  </div>
                </div>
              </div>

              {/* Admin Only Info */}
              {isAdmin && (
                <>
                  {/* Recipient Details */}
                  {selectedNotification.recipientIds && selectedNotification.recipientIds.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        margin: '0 0 1rem 0',
                        color: 'white'
                      }}>
                        Recipients ({selectedNotification.recipientIds.length} users)
                      </h3>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {selectedNotification.recipientIds.slice(0, 10).map((id, index) => (
                          <span key={index} style={{
                            backgroundColor: 'rgba(0, 80, 183, 0.2)',
                            color: '#0050B7',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '15px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            User {index + 1}
                          </span>
                        ))}
                        {selectedNotification.recipientIds.length > 10 && (
                          <span style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.6)',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '15px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            +{selectedNotification.recipientIds.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedNotification.recipientEmails && selectedNotification.recipientEmails.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        margin: '0 0 1rem 0',
                        color: 'white'
                      }}>
                        Email Recipients ({selectedNotification.recipientEmails.length} emails)
                      </h3>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {selectedNotification.recipientEmails.slice(0, 5).map((email, index) => (
                          <span key={index} style={{
                            backgroundColor: 'rgba(46, 213, 115, 0.2)',
                            color: '#2ED573',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '15px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {email}
                          </span>
                        ))}
                        {selectedNotification.recipientEmails.length > 5 && (
                          <span style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.6)',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '15px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            +{selectedNotification.recipientEmails.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.5rem 2rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <motion.button
                onClick={closeNotificationDetail}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
              
              {selectedNotification.actionUrl && (
                <motion.a
                  href={selectedNotification.actionUrl}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: '#0050B7',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: '#0066CC' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Take Action
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
