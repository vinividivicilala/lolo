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
  type: 'system' | 'announcement' | 'alert' | 'update' | 'comment' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  senderId: string;
  senderName: string;
  senderEmail?: string;
  senderPhotoURL?: string;
  recipientType: 'all' | 'specific' | 'email_only' | 'app_only';
  recipientIds?: string[];
  recipientEmails?: string[];
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
  icon: string;
  color: string;
  userReads: Record<string, boolean>;
  views?: number;
  clicks?: number;
  likes?: string[];
  comments?: any[];
  allowComments?: boolean;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'announcement' | 'update' | 'system' | 'alert'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

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

  // Load notifications untuk semua user (login dan non-login)
  useEffect(() => {
    if (!db) return;

    setIsLoading(true);
    const notificationsRef = collection(db, 'notifications');
    
    // Query untuk notifikasi yang tidak deleted, diurutkan berdasarkan tanggal
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
            // Tampilkan ke semua orang (login dan non-login)
            shouldShow = true;
            break;
            
          case 'specific':
            // Hanya untuk specific user IDs
            const recipientIds = data.recipientIds || [];
            if (recipientIds.includes(currentUserId) || 
                (user && recipientIds.includes(user.uid))) {
              shouldShow = true;
            }
            break;
            
          case 'email_only':
            // Hanya untuk email tertentu
            if (user && data.recipientEmails?.includes(user.email)) {
              shouldShow = true;
            }
            break;
            
          case 'app_only':
            // Hanya untuk logged in users
            if (user) {
              shouldShow = true;
            }
            break;
            
          default:
            shouldShow = false;
        }
        
        if (shouldShow) {
          const notification = {
            id: doc.id,
            ...data
          } as Notification;
          
          // Cek apakah user sudah baca notifikasi ini
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
      
      // Tambah user ID ke userReads
      await updateDoc(notificationRef, {
        [`userReads.${userIdToUse}`]: true,
        views: firestoreIncrement(1)
      });
      
      // Update local state
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
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
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
      
      // Update local state
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

  // Track click on notification
  const trackClick = async (notificationId: string) => {
    if (!db) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        clicks: firestoreIncrement(1)
      });
      
      // Update local state
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

  // Toggle like notification
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
          // Unlike
          await updateDoc(notificationRef, {
            likes: arrayRemove(currentUserId)
          });
          
          // Update local state
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
          // Like
          await updateDoc(notificationRef, {
            likes: arrayUnion(currentUserId)
          });
          
          // Update local state
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

  // Add comment to notification
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
      
      // Update local state
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
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete notification (admin only)
  const deleteNotification = async (notificationId: string) => {
    if (!db || !isAdmin) return;
    
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isDeleted: true
      });
      
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert('Failed to delete notification.');
    }
  };

  // Filter notifications berdasarkan tab aktif
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') {
      const currentUserId = getCurrentUserId();
      const userIdToUse = user ? user.uid : currentUserId;
      return !notification.userReads?.[userIdToUse];
    }
    if (activeTab === 'announcement') return notification.type === 'announcement';
    if (activeTab === 'update') return notification.type === 'update';
    if (activeTab === 'system') return notification.type === 'system';
    if (activeTab === 'alert') return notification.type === 'alert';
    return true;
  });

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

  // Format date with time
  const formatDateTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format number dengan K/M
  const formatNumber = (num: number = 0) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Open notification detail
  const openNotificationDetail = async (notification: Notification) => {
    setSelectedNotification(notification);
    await markAsRead(notification.id);
    await trackClick(notification.id);
  };

  // Close notification detail
  const closeNotificationDetail = () => {
    setSelectedNotification(null);
    setShowComments(false);
    setCommentText('');
  };

  // Navigate to action URL
  const handleActionClick = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    await trackClick(notification.id);
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  // Copy notification link
  const copyNotificationLink = (notificationId: string) => {
    const link = `${window.location.origin}/notifications?n=${notificationId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  // Check if user has read a notification
  const hasUserReadNotification = (notification: Notification) => {
    const currentUserId = getCurrentUserId();
    const userIdToUse = user ? user.uid : currentUserId;
    return notification.userReads?.[userIdToUse] || false;
  };

  // Check if user has liked a notification
  const hasUserLikedNotification = (notification: Notification) => {
    const currentUserId = getCurrentUserId();
    return notification.likes?.includes(currentUserId) || false;
  };

  // Get recipient type text
  const getRecipientTypeText = (type: string) => {
    switch (type) {
      case 'all': return 'All Users & Visitors';
      case 'specific': return 'Specific Users';
      case 'email_only': return 'Email Only';
      case 'app_only': return 'App Only';
      default: return type;
    }
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
        backgroundColor: 'rgba(0,0,0,0.95)',
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
          {!user && (
            <span style={{
              backgroundColor: '#6366F1',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              marginLeft: '0.5rem'
            }}>
              VISITOR
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
        {/* User Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: '1rem 2rem',
            padding: '1rem',
            backgroundColor: user ? 'rgba(0, 80, 183, 0.1)' : 'rgba(100, 100, 100, 0.1)',
            border: `1px solid ${user ? 'rgba(0, 80, 183, 0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: user ? '#0050B7' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            {user ? (user.displayName?.[0] || user.email?.[0] || 'U') : 'V'}
          </div>
          <div>
            <div style={{ fontWeight: '600', color: user ? '#0050B7' : 'rgba(255,255,255,0.8)' }}>
              {user ? (user.displayName || user.email || 'User') : 'Anonymous Visitor'}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
              {user ? 'Logged in user' : 'Viewing as guest'} • {notifications.length} notifications available
              {user && user.providerId && ` • Signed in via ${user.providerId}`}
            </div>
          </div>
          {!user && (
            <motion.button
              onClick={() => router.push('/signin')}
              style={{
                marginLeft: 'auto',
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In for More Features
            </motion.button>
          )}
        </motion.div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          padding: '1.5rem 2rem',
          overflowX: 'auto',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {['all', 'unread', 'announcement', 'update', 'system', 'alert'].map((tab) => (
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
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#0050B7',
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
                const isRead = hasUserReadNotification(notification);
                const isLiked = hasUserLikedNotification(notification);
                const likeCount = notification.likes?.length || 0;
                const commentCount = notification.comments?.length || 0;
                const viewCount = notification.views || 0;
                const clickCount = notification.clicks || 0;
                
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

                    {/* Priority badge */}
                    {notification.priority === 'urgent' && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#FF4757',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '10px',
                        zIndex: 2
                      }}>
                        URGENT
                      </div>
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
                              marginBottom: '0.5rem',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.6)'
                              }}>
                                From: {notification.senderName}
                                {notification.senderEmail && ` (${notification.senderEmail})`}
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
                              <span style={{
                                fontSize: '0.8rem',
                                color: '#FFA502',
                                backgroundColor: 'rgba(255, 165, 2, 0.1)',
                                padding: '0.1rem 0.5rem',
                                borderRadius: '10px'
                              }}>
                                {getRecipientTypeText(notification.recipientType)}
                              </span>
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
                            
                            {/* Stats */}
                            <div style={{
                              display: 'flex',
                              gap: '0.8rem',
                              fontSize: '0.7rem',
                              color: 'rgba(255,255,255,0.5)'
                            }}>
                              <span>👁️ {formatNumber(viewCount)}</span>
                              <span>👆 {formatNumber(clickCount)}</span>
                              <span>❤️ {formatNumber(likeCount)}</span>
                              <span>💬 {formatNumber(commentCount)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p style={{
                          margin: '0',
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.95rem',
                          lineHeight: 1.5
                        }}>
                          {notification.message.length > 200
                            ? `${notification.message.substring(0, 200)}...`
                            : notification.message}
                        </p>
                        
                        {/* Action buttons */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '1rem', 
                          marginTop: '1rem',
                          alignItems: 'center'
                        }}>
                          {notification.actionUrl && (
                            <motion.button
                              onClick={(e) => handleActionClick(notification, e)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                                border: '1px solid rgba(0, 255, 0, 0.3)',
                                borderRadius: '6px',
                                color: '#00FF00',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                              </svg>
                              Take Action
                            </motion.button>
                          )}
                          
                          <motion.button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await toggleLike(notification.id);
                            }}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: isLiked ? 'rgba(255, 71, 87, 0.2)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${isLiked ? '#FF4757' : 'rgba(255,255,255,0.1)'}`,
                              borderRadius: '6px',
                              color: isLiked ? '#FF4757' : 'rgba(255,255,255,0.7)',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isLiked ? '❤️ Liked' : '🤍 Like'} ({likeCount})
                          </motion.button>
                          
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyNotificationLink(notification.id);
                            }}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px',
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            Copy Link
                          </motion.button>
                          
                          {isAdmin && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              style={{
                                padding: '0.4rem 0.8rem',
                                backgroundColor: 'rgba(255, 71, 87, 0.2)',
                                border: '1px solid rgba(255, 71, 87, 0.4)',
                                borderRadius: '6px',
                                color: '#FF4757',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Delete
                            </motion.button>
                          )}
                        </div>
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
          backgroundColor: 'rgba(0,0,0,0.9)',
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
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      From: {selectedNotification.senderName}
                      {selectedNotification.senderEmail && ` (${selectedNotification.senderEmail})`}
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
                    <span style={{
                      fontSize: '0.8rem',
                      padding: '0.2rem 0.6rem',
                      backgroundColor: 'rgba(255, 165, 2, 0.1)',
                      color: '#FFA502',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      {getRecipientTypeText(selectedNotification.recipientType)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <motion.button
                  onClick={() => setShowComments(!showComments)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: showComments ? '#0050B7' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💬 Comments ({selectedNotification.comments?.length || 0})
                </motion.button>
                
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
            </div>

            {/* Modal Content */}
            <div style={{
              flex: 1,
              padding: '2rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* Message Content */}
              <div style={{
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

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#00FF00',
                    marginBottom: '0.3rem'
                  }}>
                    {formatNumber(selectedNotification.views || 0)}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    Views
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#FFA502',
                    marginBottom: '0.3rem'
                  }}>
                    {formatNumber(selectedNotification.clicks || 0)}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    Clicks
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#FF4757',
                    marginBottom: '0.3rem'
                  }}>
                    {formatNumber(selectedNotification.likes?.length || 0)}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    Likes
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#6366F1',
                    marginBottom: '0.3rem'
                  }}>
                    {formatNumber(selectedNotification.comments?.length || 0)}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    Comments
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {selectedNotification.actionUrl && (
                <div style={{ textAlign: 'center' }}>
                  <motion.a
                    href={selectedNotification.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(selectedNotification.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '1rem 2rem',
                      backgroundColor: '#0050B7',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.05, backgroundColor: '#0066CC' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Take Action Now
                  </motion.a>
                </div>
              )}

              {/* Comments Section */}
              {showComments && (
                <div style={{
                  marginTop: '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    margin: '0 0 1rem 0',
                    color: 'white'
                  }}>
                    Comments ({selectedNotification.comments?.length || 0})
                  </h3>
                  
                  {/* Add Comment Form */}
                  <div style={{
                    marginBottom: '1.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: user ? '#0050B7' : '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        {getCurrentUserName()[0]}
                      </div>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={user ? "Add a comment..." : "Sign in to add a comment"}
                        disabled={!user || isSubmittingComment}
                        rows={3}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '0.9rem',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}
                      />
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '0.5rem'
                    }}>
                      {!user && (
                        <motion.button
                          onClick={() => router.push('/signin')}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Sign In to Comment
                        </motion.button>
                      )}
                      {user && (
                        <motion.button
                          onClick={() => addComment(selectedNotification.id)}
                          disabled={!commentText.trim() || isSubmittingComment}
                          style={{
                            padding: '0.5rem 1.5rem',
                            backgroundColor: commentText.trim() && !isSubmittingComment ? '#0050B7' : '#666',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: commentText.trim() && !isSubmittingComment ? 'pointer' : 'not-allowed'
                          }}
                          whileHover={commentText.trim() && !isSubmittingComment ? { scale: 1.05 } : {}}
                          whileTap={commentText.trim() && !isSubmittingComment ? { scale: 0.95 } : {}}
                        >
                          {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                  
                  {/* Comments List */}
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {selectedNotification.comments && selectedNotification.comments.length > 0 ? (
                      [...selectedNotification.comments]
                        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                        .map((comment, index) => (
                          <div key={comment.id || index} style={{
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            padding: '1rem',
                            borderRadius: '8px',
                            borderLeft: '3px solid #0050B7'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '0.5rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: comment.userEmail === user?.email ? '#0050B7' : '#666',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.7rem',
                                  flexShrink: 0
                                }}>
                                  {comment.userName?.[0] || 'U'}
                                </div>
                                <div>
                                  <div style={{
                                    fontWeight: '600',
                                    color: 'white',
                                    fontSize: '0.9rem'
                                  }}>
                                    {comment.userName || 'Anonymous'}
                                    {comment.userEmail === user?.email && (
                                      <span style={{
                                        marginLeft: '0.5rem',
                                        fontSize: '0.7rem',
                                        backgroundColor: '#0050B7',
                                        color: 'white',
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '4px'
                                      }}>
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div style={{
                                    fontSize: '0.7rem',
                                    color: 'rgba(255,255,255,0.5)'
                                  }}>
                                    {formatDateTime(comment.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <span style={{
                                  fontSize: '0.8rem',
                                  color: 'rgba(255,255,255,0.5)'
                                }}>
                                  ❤️ {comment.likes?.length || 0}
                                </span>
                              </div>
                            </div>
                            <p style={{
                              margin: 0,
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.9rem',
                              lineHeight: 1.4
                            }}>
                              {comment.comment}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.9rem'
                      }}>
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.5rem 2rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.5)'
              }}>
                Sent: {formatDateTime(selectedNotification.createdAt)}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <motion.button
                  onClick={async () => {
                    await toggleLike(selectedNotification.id);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: selectedNotification.likes?.includes(getCurrentUserId()) 
                      ? 'rgba(255, 71, 87, 0.2)' 
                      : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${selectedNotification.likes?.includes(getCurrentUserId()) 
                      ? '#FF4757' 
                      : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '8px',
                    color: selectedNotification.likes?.includes(getCurrentUserId()) 
                      ? '#FF4757' 
                      : 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedNotification.likes?.includes(getCurrentUserId()) ? '❤️ Liked' : '🤍 Like'}
                  ({selectedNotification.likes?.length || 0})
                </motion.button>
                
                <motion.button
                  onClick={closeNotificationDetail}
                  style={{
                    padding: '0.5rem 1.5rem',
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
