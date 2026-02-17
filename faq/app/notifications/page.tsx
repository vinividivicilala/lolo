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
  getDoc,
  arrayUnion,
  arrayRemove,
  increment as firestoreIncrement
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
  type?: 'announcement' | 'maintenance' | 'system' | 'update' | 'alert' | 'info';
  senderId: string;
  senderName: string;
  senderEmail?: string;
  recipientType: 'all' | 'specific' | 'email';
  recipientIds?: string[];
  recipientEmails?: string[];
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Timestamp;
  scheduledTime?: string;
  actionUrl?: string;
  userReads: Record<string, boolean>;
  views?: number;
  clicks?: number;
  likes?: string[];
  comments?: any[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

interface NotificationComment {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  comment: string;
  createdAt: Timestamp;
  likes: string[];
}

export default function NotificationsPage(): React.JSX.Element {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'announcement' | 'maintenance' | 'system' | 'update' | 'alert' | 'info'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Generate anonymous user ID untuk non-logged in users
  const getOrCreateAnonymousId = () => {
    let anonymousId = localStorage.getItem('anonymous_user_id');
    if (!anonymousId) {
      anonymousId = 'anonymous_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('anonymous_user_id', anonymousId);
    }
    return anonymousId;
  };

  // Get current user ID (logged in atau anonymous)
  const getCurrentUserId = () => {
    return user ? user.uid : getOrCreateAnonymousId();
  };

  // Get current user name
  const getCurrentUserName = () => {
    if (user) {
      return user.displayName || user.email?.split('@')[0] || 'User';
    }
    return 'Anonymous Visitor';
  };

  // Load notifications untuk semua user
  useEffect(() => {
    if (!db) return;

    setIsLoading(true);
    const notificationsRef = collection(db, 'notifications');
    
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: Notification[] = [];
      let unread = 0;
      const currentUserId = getCurrentUserId();
      
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        
        // Skip deleted notifications
        if (data.isDeleted) return;
        
        // Determine if user should see this notification
        let shouldShow = false;
        
        switch (data.recipientType) {
          case 'all':
            shouldShow = true;
            break;
            
          case 'specific':
            const recipientIds = data.recipientIds || [];
            if (recipientIds.includes(currentUserId) || 
                (user && recipientIds.includes(user.uid))) {
              shouldShow = true;
            }
            break;
            
          case 'email':
            if (user && data.recipientEmails?.includes(user.email)) {
              shouldShow = true;
            }
            break;
            
          default:
            shouldShow = false;
        }
        
        if (shouldShow) {
          const notification = {
            id: doc.id,
            title: data.title || 'No Title',
            message: data.message || 'No Message',
            type: data.type || 'info',
            senderId: data.senderId || '',
            senderName: data.senderName || 'Unknown',
            senderEmail: data.senderEmail,
            recipientType: data.recipientType || 'all',
            recipientIds: data.recipientIds || [],
            recipientEmails: data.recipientEmails || [],
            isRead: data.isRead || false,
            isDeleted: data.isDeleted || false,
            createdAt: data.createdAt || Timestamp.now(),
            scheduledTime: data.scheduledTime,
            actionUrl: data.actionUrl,
            userReads: data.userReads || {},
            views: data.views || 0,
            clicks: data.clicks || 0,
            likes: data.likes || [],
            comments: data.comments || [],
            status: data.status || 'sent'
          } as Notification;
          
          const isReadByUser = notification.userReads?.[currentUserId] || 
                              (user && notification.userReads?.[user.uid]) || 
                              false;
          if (!isReadByUser) {
            unread++;
          }
          
          notificationsData.push(notification);
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
  }, [db, user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!db) return;
    
    try {
      const currentUserId = getCurrentUserId();
      const userIdToUse = user ? user.uid : currentUserId;
      const notificationRef = doc(db, 'notifications', notificationId);
      
      await updateDoc(notificationRef, {
        [`userReads.${userIdToUse}`]: true,
        views: firestoreIncrement(1)
      });
      
      setNotifications(prev => prev.map(notif => {
        if (notif.id === notificationId) {
          return {
            ...notif,
            userReads: {
              ...notif.userReads,
              [userIdToUse]: true
            },
            views: (notif.views || 0) + 1
          };
        }
        return notif;
      }));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!db) return;
    
    try {
      const currentUserId = getCurrentUserId();
      const userIdToUse = user ? user.uid : currentUserId;
      
      const updatePromises = notifications
        .filter(notification => !notification.userReads?.[userIdToUse])
        .map(async (notification) => {
          const notificationRef = doc(db, 'notifications', notification.id);
          await updateDoc(notificationRef, {
            [`userReads.${userIdToUse}`]: true,
            views: firestoreIncrement(1)
          });
        });
      
      await Promise.all(updatePromises);
      
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        userReads: {
          ...notification.userReads,
          [userIdToUse]: true
        },
        views: (notification.views || 0) + 1
      })));
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Track click
  const trackClick = async (notificationId: string) => {
    if (!db) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        clicks: firestoreIncrement(1)
      });
      
      setNotifications(prev => prev.map(notif => {
        if (notif.id === notificationId) {
          return {
            ...notif,
            clicks: (notif.clicks || 0) + 1
          };
        }
        return notif;
      }));
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  // Toggle like
  const toggleLike = async (notificationId: string) => {
    if (!db) return;
    
    try {
      const currentUserId = getCurrentUserId();
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (notificationDoc.exists()) {
        const notification = notificationDoc.data() as Notification;
        const isLiked = notification.likes?.includes(currentUserId) || false;
        
        if (isLiked) {
          await updateDoc(notificationRef, {
            likes: arrayRemove(currentUserId)
          });
          
          setNotifications(prev => prev.map(notif => {
            if (notif.id === notificationId) {
              return {
                ...notif,
                likes: notif.likes?.filter(id => id !== currentUserId) || []
              };
            }
            return notif;
          }));
        } else {
          await updateDoc(notificationRef, {
            likes: arrayUnion(currentUserId)
          });
          
          setNotifications(prev => prev.map(notif => {
            if (notif.id === notificationId) {
              return {
                ...notif,
                likes: [...(notif.likes || []), currentUserId]
              };
            }
            return notif;
          }));
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Add comment
  const addComment = async (notificationId: string) => {
    if (!db || !commentText.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      const currentUserId = getCurrentUserId();
      const currentUserName = getCurrentUserName();
      const notificationRef = doc(db, 'notifications', notificationId);
      
      const newComment = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: currentUserName,
        userEmail: user?.email,
        comment: commentText.trim(),
        createdAt: Timestamp.now(),
        likes: []
      };
      
      await updateDoc(notificationRef, {
        comments: arrayUnion(newComment)
      });
      
      setNotifications(prev => prev.map(notif => {
        if (notif.id === notificationId) {
          return {
            ...notif,
            comments: [...(notif.comments || []), newComment]
          };
        }
        return notif;
      }));
      
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(prev => prev ? {
          ...prev,
          comments: [...(prev.comments || []), newComment]
        } : null);
      }
      
      setCommentText('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') {
      const currentUserId = getCurrentUserId();
      const userIdToUse = user ? user.uid : currentUserId;
      return !notification.userReads?.[userIdToUse];
    }
    return notification.type === activeTab;
  });

  // Get notification type label
  const getTypeLabel = (type: string | undefined) => {
    if (!type) return 'INFO';
    
    const labels: Record<string, string> = {
      announcement: 'ANNOUNCEMENT',
      maintenance: 'MAINTENANCE',
      system: 'SYSTEM',
      update: 'UPDATE',
      alert: 'ALERT',
      info: 'INFO'
    };
    return labels[type] || type.toUpperCase();
  };

  // Format date
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date time
  const formatDateTime = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate();
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format number
  const formatNumber = (num: number = 0) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Check if user has read notification
  const hasUserReadNotification = (notification: Notification) => {
    const currentUserId = getCurrentUserId();
    const userIdToUse = user ? user.uid : currentUserId;
    return notification.userReads?.[userIdToUse] || false;
  };

  // Check if user has liked notification
  const hasUserLikedNotification = (notification: Notification) => {
    const currentUserId = getCurrentUserId();
    return notification.likes?.includes(currentUserId) || false;
  };

  // Get status color
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'draft': return '#666666';
      case 'scheduled': return '#ffaa00';
      case 'sent': return '#00ff00';
      case 'failed': return '#ff0000';
      default: return '#666666';
    }
  };

  // Get status label
  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'draft': return 'DRAFT';
      case 'scheduled': return 'SCHEDULED';
      case 'sent': return 'SENT';
      case 'failed': return 'FAILED';
      default: return 'SENT';
    }
  };

  // SVG North East Arrow component - Large
  const NorthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M7 7L17 17" />
      <path d="M7 17V7H17" />
    </svg>
  );

  // SVG South East Arrow component - Large
  const SouthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 5L19 19" />
      <path d="M5 19H19V5" />
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '2rem 3rem',
        backgroundColor: '#000000',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #222222'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <motion.button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            whileHover={{ opacity: 0.8 }}
            whileTap={{ scale: 0.95 }}
          >
            <NorthEastArrow />
          </motion.button>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '700',
            margin: 0,
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}>
            Halaman Notifikasi
          </h1>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <span style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#ffffff'
          }}>
            {user?.displayName || user?.email || 'VISITOR'}
          </span>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        paddingTop: '180px',
        paddingBottom: '3rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        padding: '12rem 3rem 3rem 3rem'
      }}>
        {/* Time Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4rem',
          padding: '1.5rem 0',
          borderBottom: '1px solid #222222'
        }}>
          <div style={{
            fontSize: '1.5rem',
            color: '#888888',
            fontWeight: '500'
          }}>
            {currentTime}
          </div>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            {unreadCount > 0 && (
              <motion.button
                onClick={markAllAsRead}
                style={{
                  padding: '1rem 3rem',
                  backgroundColor: 'transparent',
                  border: '2px solid #666666',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}
                whileHover={{ backgroundColor: '#111111' }}
                whileTap={{ scale: 0.95 }}
              >
                MARK ALL READ
              </motion.button>
            )}
            
            <motion.button
              onClick={() => router.push('/notifications/create')}
              style={{
                padding: '1rem 3rem',
                backgroundColor: '#ffffff',
                border: 'none',
                color: '#000000',
                fontSize: '1.5rem',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              CREATE NOTIFICATION
              <SouthEastArrow />
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '3rem',
          flexWrap: 'wrap'
        }}>
          {[
            { value: 'all', label: 'ALL' },
            { value: 'unread', label: 'UNREAD' },
            { value: 'announcement', label: 'ANNOUNCEMENT' },
            { value: 'maintenance', label: 'MAINTENANCE' },
            { value: 'system', label: 'SYSTEM' },
            { value: 'update', label: 'UPDATE' },
            { value: 'alert', label: 'ALERT' },
            { value: 'info', label: 'INFO' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              style={{
                padding: '1rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.value ? '3px solid #ffffff' : 'none',
                color: activeTab === tab.value ? '#ffffff' : '#666666',
                fontSize: '1.5rem',
                fontWeight: activeTab === tab.value ? '700' : '500',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              {tab.label} {tab.value === 'unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '3px solid #333333',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            gap: '2rem'
          }}>
            <div style={{
              fontSize: '4rem',
              color: '#333333'
            }}>
              📋
            </div>
            <div style={{
              color: '#666666',
              fontSize: '2rem',
              fontWeight: '500'
            }}>
              NO NOTIFICATIONS FOUND
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {filteredNotifications.map((notification) => {
              const isRead = hasUserReadNotification(notification);
              const isLiked = hasUserLikedNotification(notification);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    setSelectedNotification(notification);
                    markAsRead(notification.id);
                    trackClick(notification.id);
                  }}
                  style={{
                    backgroundColor: isRead ? '#111111' : '#1a1a1a',
                    padding: '2rem',
                    cursor: 'pointer',
                    border: isRead ? '1px solid #222222' : '1px solid #333333',
                    position: 'relative'
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: getStatusColor(notification.status),
                    color: '#000000',
                    padding: '0.3rem 1rem',
                    fontSize: '1rem',
                    fontWeight: '700'
                  }}>
                    {getStatusLabel(notification.status)}
                  </div>

                  {/* Type */}
                  <div style={{
                    fontSize: '1.2rem',
                    color: '#888888',
                    fontWeight: '500',
                    marginBottom: '1rem'
                  }}>
                    {getTypeLabel(notification.type)}
                  </div>

                  {/* Title */}
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    margin: '0 0 1rem 0',
                    color: '#ffffff',
                    paddingRight: '80px'
                  }}>
                    {notification.title}
                  </h2>

                  {/* Message Preview */}
                  <p style={{
                    fontSize: '1.2rem',
                    color: '#cccccc',
                    margin: '0 0 2rem 0',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {notification.message}
                  </p>

                  {/* Meta Info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #222222',
                    paddingTop: '1.5rem'
                  }}>
                    <div style={{
                      fontSize: '1rem',
                      color: '#888888'
                    }}>
                      From: {notification.senderName}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      gap: '1.5rem',
                      fontSize: '1.2rem',
                      color: '#666666'
                    }}>
                      <span>👁️ {formatNumber(notification.views || 0)}</span>
                      <span>👆 {formatNumber(notification.clicks || 0)}</span>
                      <span>❤️ {formatNumber(notification.likes?.length || 0)}</span>
                      <span>💬 {formatNumber(notification.comments?.length || 0)}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{
                    fontSize: '1rem',
                    color: '#666666',
                    marginTop: '0.5rem',
                    textAlign: 'right'
                  }}>
                    {formatDate(notification.createdAt)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          boxSizing: 'border-box'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: '#111111',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #222222'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid #222222',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '1.2rem',
                  color: '#888888',
                  marginBottom: '0.5rem'
                }}>
                  {getTypeLabel(selectedNotification.type)}
                </div>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: '600',
                  margin: 0,
                  color: '#ffffff'
                }}>
                  {selectedNotification.title}
                </h2>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowComments(!showComments)}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #333333',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  COMMENTS ({selectedNotification.comments?.length || 0})
                </button>
                
                <button
                  onClick={() => setSelectedNotification(null)}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'transparent',
                    border: '1px solid #333333',
                    color: '#ffffff',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{
              flex: 1,
              padding: '2rem',
              overflowY: 'auto'
            }}>
              {/* Status Bar */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '2rem',
                padding: '1rem',
                backgroundColor: '#1a1a1a',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontSize: '1rem', color: '#888888', marginBottom: '0.3rem' }}>STATUS</div>
                  <div style={{
                    backgroundColor: getStatusColor(selectedNotification.status),
                    color: '#000000',
                    padding: '0.3rem 1rem',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    display: 'inline-block'
                  }}>
                    {getStatusLabel(selectedNotification.status)}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '1rem', color: '#888888', marginBottom: '0.3rem' }}>SENDER</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>{selectedNotification.senderName}</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '1rem', color: '#888888', marginBottom: '0.3rem' }}>RECIPIENT</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                    {selectedNotification.recipientType === 'all' ? 'ALL USERS' :
                     selectedNotification.recipientType === 'specific' ? 'SPECIFIC USERS' :
                     'EMAIL ADDRESSES'}
                  </div>
                </div>
                
                {selectedNotification.scheduledTime && (
                  <div>
                    <div style={{ fontSize: '1rem', color: '#888888', marginBottom: '0.3rem' }}>SCHEDULED</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                      {new Date(selectedNotification.scheduledTime).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Message */}
              <div style={{
                marginBottom: '2rem',
                padding: '2rem',
                backgroundColor: '#1a1a1a',
                fontSize: '1.4rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-line'
              }}>
                {selectedNotification.message}
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1a1a1a' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff' }}>
                    {formatNumber(selectedNotification.views || 0)}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#888888' }}>VIEWS</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1a1a1a' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff' }}>
                    {formatNumber(selectedNotification.clicks || 0)}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#888888' }}>CLICKS</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1a1a1a' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff' }}>
                    {formatNumber(selectedNotification.likes?.length || 0)}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#888888' }}>LIKES</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1a1a1a' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff' }}>
                    {formatNumber(selectedNotification.comments?.length || 0)}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#888888' }}>COMMENTS</div>
                </div>
              </div>

              {/* Action URL */}
              {selectedNotification.actionUrl && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <a
                    href={selectedNotification.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(selectedNotification.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.5rem 3rem',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    TAKE ACTION
                    <SouthEastArrow />
                  </a>
                </div>
              )}

              {/* Comments Section */}
              {showComments && (
                <div style={{
                  borderTop: '1px solid #222222',
                  paddingTop: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: '0 0 2rem 0'
                  }}>
                    COMMENTS
                  </h3>

                  {/* Add Comment */}
                  <div style={{
                    marginBottom: '2rem',
                    backgroundColor: '#1a1a1a',
                    padding: '1.5rem'
                  }}>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={user ? "WRITE YOUR COMMENT..." : "SIGN IN TO COMMENT"}
                      disabled={!user}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: '#000000',
                        border: '1px solid #333333',
                        color: '#ffffff',
                        fontSize: '1.2rem',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        resize: 'vertical',
                        marginBottom: '1rem'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => addComment(selectedNotification.id)}
                        disabled={!user || !commentText.trim() || isSubmittingComment}
                        style={{
                          padding: '1rem 3rem',
                          backgroundColor: user && commentText.trim() ? '#ffffff' : '#333333',
                          border: 'none',
                          color: user && commentText.trim() ? '#000000' : '#666666',
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          cursor: user && commentText.trim() ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {isSubmittingComment ? 'POSTING...' : 'POST COMMENT'}
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div>
                    {selectedNotification.comments && selectedNotification.comments.length > 0 ? (
                      [...selectedNotification.comments]
                        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                        .map((comment, index) => (
                          <div key={comment.id || index} style={{
                            padding: '1.5rem',
                            backgroundColor: '#1a1a1a',
                            marginBottom: '1rem'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '1rem'
                            }}>
                              <div>
                                <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                                  {comment.userName}
                                </span>
                                {comment.userEmail === user?.email && (
                                  <span style={{
                                    marginLeft: '1rem',
                                    fontSize: '0.9rem',
                                    color: '#888888'
                                  }}>
                                    (YOU)
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.9rem', color: '#888888' }}>
                                {formatDateTime(comment.createdAt)}
                              </span>
                            </div>
                            <p style={{
                              fontSize: '1.2rem',
                              lineHeight: 1.5,
                              margin: 0,
                              color: '#cccccc'
                            }}>
                              {comment.comment}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#666666',
                        fontSize: '1.2rem'
                      }}>
                        NO COMMENTS YET
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '2rem',
              borderTop: '1px solid #222222',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ color: '#888888' }}>
                {formatDateTime(selectedNotification.createdAt)}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => toggleLike(selectedNotification.id)}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #333333',
                    color: hasUserLikedNotification(selectedNotification) ? '#ff4444' : '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {hasUserLikedNotification(selectedNotification) ? '❤️ LIKED' : '🤍 LIKE'}
                  ({selectedNotification.likes?.length || 0})
                </button>
                
                <button
                  onClick={() => setSelectedNotification(null)}
                  style={{
                    padding: '1rem 3rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #333333',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
