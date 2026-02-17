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
  type: string;
  senderName: string;
  senderEmail?: string;
  createdAt: Timestamp;
  userReads: Record<string, boolean>;
  views: number;
  status?: string;
}

export default function NotificationsPage(): React.JSX.Element {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update current time (without seconds)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Get current user ID
  const getCurrentUserId = () => {
    if (user) return user.uid;
    let anonymousId = localStorage.getItem('anonymous_id');
    if (!anonymousId) {
      anonymousId = 'anon_' + Date.now();
      localStorage.setItem('anonymous_id', anonymousId);
    }
    return anonymousId;
  };

  // Load notifications
  useEffect(() => {
    if (!db) return;

    setIsLoading(true);
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: Notification[] = [];
      let unread = 0;
      const currentUserId = getCurrentUserId();
      
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.isDeleted) return;
        
        const notification = {
          id: doc.id,
          title: data.title || '',
          message: data.message || '',
          type: data.type || 'info',
          senderName: data.senderName || 'System',
          senderEmail: data.senderEmail,
          createdAt: data.createdAt || Timestamp.now(),
          userReads: data.userReads || {},
          views: data.views || 0,
          status: data.status || 'sent'
        };
        
        if (!notification.userReads[currentUserId]) {
          unread++;
        }
        
        notificationsData.push(notification);
      });
      
      setNotifications(notificationsData);
      setUnreadCount(unread);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, user]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    if (!db) return;
    
    try {
      const currentUserId = getCurrentUserId();
      const notificationRef = doc(db, 'notifications', notificationId);
      
      await updateDoc(notificationRef, {
        [`userReads.${currentUserId}`]: true,
        views: firestoreIncrement(1)
      });
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Format date
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // SVG North East Arrow - Large
  const NorthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M7 7L17 17" />
      <path d="M7 17V7H17" />
    </svg>
  );

  // SVG South East Arrow - Large
  const SouthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
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
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#ffffff',
      padding: '3rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #333333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <NorthEastArrow />
          </button>
          <span style={{ fontSize: '3rem', color: '#ffffff' }}>notifikasi</span>
          {unreadCount > 0 && (
            <span style={{ color: '#ffffff', fontSize: '1.5rem' }}>({unreadCount})</span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <span style={{ color: '#ffffff', fontSize: '1.8rem' }}>{currentTime}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem', color: '#ffffff' }}>
              {user?.displayName || user?.email || 'visitor'}
            </span>
            <NorthEastArrow />
          </div>
        </div>
      </div>

      {/* Create Notification Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '3rem'
      }}>
        <button
          onClick={() => router.push('/notifications/create')}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '2rem',
            padding: 0
          }}
        >
          create notification
          <SouthEastArrow />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '6rem', color: '#ffffff', fontSize: '2rem' }}>
          loading...
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '6rem', 
          color: '#ffffff',
          fontSize: '2rem'
        }}>
          no notifications
        </div>
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {notifications.map((notification) => {
            const isRead = notification.userReads[getCurrentUserId()];
            
            return (
              <div
                key={notification.id}
                onClick={() => {
                  setSelectedNotification(notification);
                  if (!isRead) markAsRead(notification.id);
                }}
                style={{
                  padding: '2.5rem 0',
                  borderBottom: '1px solid #333333',
                  cursor: 'pointer',
                  opacity: isRead ? 0.7 : 1
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  color: '#ffffff'
                }}>
                  <span>{notification.type}</span>
                  <span>{formatDate(notification.createdAt)}</span>
                </div>
                <div style={{ 
                  fontSize: '2.2rem', 
                  marginBottom: '1rem',
                  fontWeight: 'normal',
                  color: '#ffffff'
                }}>
                  {notification.title}
                </div>
                <div style={{ 
                  color: '#ffffff', 
                  fontSize: '1.8rem',
                  lineHeight: '1.6'
                }}>
                  {notification.message.length > 150 
                    ? notification.message.substring(0, 150) + '...' 
                    : notification.message}
                </div>
                <div style={{ 
                  marginTop: '1.5rem', 
                  color: '#ffffff',
                  fontSize: '1.5rem'
                }}>
                  from {notification.senderName}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000000',
          padding: '3rem',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #333333'
            }}>
              <button
                onClick={() => setSelectedNotification(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ffffff',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <NorthEastArrow />
              </button>
              <span style={{ color: '#ffffff', fontSize: '1.8rem' }}>notification</span>
              <span style={{ color: '#ffffff', fontSize: '1.8rem' }}>
                {formatDate(selectedNotification.createdAt)}
              </span>
            </div>

            {/* Content */}
            <div>
              <div style={{ 
                color: '#ffffff', 
                marginBottom: '2rem',
                fontSize: '2rem'
              }}>
                {selectedNotification.type}
              </div>
              
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '3rem',
                fontWeight: 'normal',
                lineHeight: '1.3',
                color: '#ffffff'
              }}>
                {selectedNotification.title}
              </div>
              
              <div style={{ 
                lineHeight: '2', 
                marginBottom: '4rem',
                color: '#ffffff',
                fontSize: '2.2rem',
                whiteSpace: 'pre-line'
              }}>
                {selectedNotification.message}
              </div>
              
              <div style={{ 
                color: '#ffffff',
                fontSize: '2rem'
              }}>
                — {selectedNotification.senderName}
                {selectedNotification.senderEmail && (
                  <span style={{ color: '#ffffff', marginLeft: '1rem' }}>
                    ({selectedNotification.senderEmail})
                  </span>
                )}
              </div>
            </div>

            {/* Views */}
            <div style={{ 
              marginTop: '4rem',
              paddingTop: '2rem',
              borderTop: '1px solid #333333',
              color: '#ffffff',
              fontSize: '1.8rem'
            }}>
              viewed {selectedNotification.views} times
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
