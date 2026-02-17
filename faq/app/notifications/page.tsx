'use client';

import React, { useState, useEffect } from "react";
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

interface Reply {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp;
  replies: Reply[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  senderName: string;
  createdAt: Timestamp;
  userReads: Record<string, boolean>;
  views: number;
  comments: Comment[];
}

export default function NotificationsPage(): React.JSX.Element {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Get current user name
  const getCurrentUserName = () => {
    if (user) {
      return user.displayName || user.email?.split('@')[0] || 'User';
    }
    let anonymousName = localStorage.getItem('anonymous_name');
    if (!anonymousName) {
      anonymousName = 'Anonymous';
      localStorage.setItem('anonymous_name', anonymousName);
    }
    return anonymousName;
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
          createdAt: data.createdAt || Timestamp.now(),
          userReads: data.userReads || {},
          views: data.views || 0,
          comments: data.comments || []
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
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Add comment
  const addComment = async (notificationId: string) => {
    if (!db || !commentText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const currentUserId = getCurrentUserId();
      const currentUserName = getCurrentUserName();
      const notificationRef = doc(db, 'notifications', notificationId);
      
      const newComment = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: currentUserName,
        text: commentText.trim(),
        createdAt: Timestamp.now(),
        replies: []
      };
      
      await updateDoc(notificationRef, {
        comments: arrayUnion(newComment)
      });
      
      setCommentText('');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add reply
  const addReply = async (notificationId: string, commentId: string) => {
    if (!db || !replyText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const currentUserId = getCurrentUserId();
      const currentUserName = getCurrentUserName();
      const notificationRef = doc(db, 'notifications', notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification) {
        const updatedComments = notification.comments.map(comment => {
          if (comment.id === commentId) {
            const newReply = {
              id: Date.now().toString(),
              userId: currentUserId,
              userName: currentUserName,
              text: replyText.trim(),
              createdAt: Timestamp.now()
            };
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        });
        
        await updateDoc(notificationRef, {
          comments: updatedComments
        });
      }
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time ago
  const timeAgo = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // SVG Arrows
  const NorthEastArrow = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M7 7L17 17" />
      <path d="M7 17V7H17" />
    </svg>
  );

  const SouthEastArrow = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M5 5L19 19" />
      <path d="M5 19H19V5" />
    </svg>
  );

  const ReplyArrow = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M7 7L3 11L7 15" />
      <path d="M3 11H15C17.7614 11 20 13.2386 20 16V17" />
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
        marginBottom: '4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', padding: 0 }}>
            <NorthEastArrow />
          </button>
          <span style={{ fontSize: '3rem' }}>notifications</span>
          {unreadCount > 0 && <span style={{ fontSize: '1.5rem' }}>({unreadCount})</span>}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{user?.displayName || user?.email || 'visitor'}</span>
          <NorthEastArrow />
        </div>
      </div>

      {/* Create Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
        <button onClick={() => router.push('/notifications/create')} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.5rem', padding: 0 }}>
          create notification
          <SouthEastArrow />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '6rem', fontSize: '2rem' }}>loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem', fontSize: '2rem' }}>no notifications</div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                  padding: '2rem 0',
                  cursor: 'pointer',
                  opacity: isRead ? 0.5 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.2rem', color: '#888888' }}>
                  <span>{notification.type}</span>
                  <span>{timeAgo(notification.createdAt)}</span>
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{notification.title}</div>
                <div style={{ fontSize: '1.2rem', color: '#cccccc', marginBottom: '1rem' }}>
                  {notification.message.length > 100 ? notification.message.substring(0, 100) + '...' : notification.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', color: '#888888' }}>
                  <span>{notification.senderName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💬 {notification.comments?.length || 0}</span>
                    <span>👁️ {notification.views || 0}</span>
                  </div>
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <button onClick={() => { setSelectedNotification(null); setReplyingTo(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', padding: 0 }}>
                <NorthEastArrow />
              </button>
              <span style={{ fontSize: '1.2rem', color: '#888888' }}>{timeAgo(selectedNotification.createdAt)}</span>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ fontSize: '1.2rem', color: '#888888', marginBottom: '1rem' }}>{selectedNotification.type}</div>
              <div style={{ fontSize: '3rem', marginBottom: '2rem', lineHeight: '1.3' }}>{selectedNotification.title}</div>
              <div style={{ fontSize: '1.5rem', lineHeight: '1.8', marginBottom: '2rem', color: '#cccccc' }}>{selectedNotification.message}</div>
              <div style={{ fontSize: '1.2rem', color: '#888888' }}>— {selectedNotification.senderName}</div>
            </div>

            {/* Comments Section */}
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>comments ({selectedNotification.comments?.length || 0})</div>

              {/* Add Comment */}
              <div style={{ marginBottom: '3rem' }}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="write a comment..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '1rem 0',
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => addComment(selectedNotification.id)}
                    disabled={!commentText.trim() || isSubmitting}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: commentText.trim() && !isSubmitting ? '#ffffff' : '#444444',
                      fontSize: '1.2rem',
                      cursor: commentText.trim() && !isSubmitting ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    post
                    <SouthEastArrow />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {selectedNotification.comments && selectedNotification.comments.length > 0 ? (
                [...selectedNotification.comments].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((comment) => (
                  <div key={comment.id} style={{ marginBottom: '2.5rem' }}>
                    {/* Comment */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1rem', color: '#888888' }}>
                        <span>{comment.userName}</span>
                        <span>{timeAgo(comment.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{comment.text}</div>
                      
                      {/* Reply Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setReplyingTo(comment.id); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#888888',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '1rem'
                        }}
                      >
                        <ReplyArrow /> reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ marginLeft: '2rem' }}>
                        {comment.replies.map((reply) => (
                          <div key={reply.id} style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#888888' }}>
                              <span>{reply.userName}</span>
                              <span>{timeAgo(reply.createdAt)}</span>
                            </div>
                            <div style={{ fontSize: '1.1rem' }}>{reply.text}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div style={{ marginTop: '1rem', marginLeft: '2rem' }}>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="write a reply..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0',
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '1.1rem',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                          <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: '#888888', fontSize: '1rem', cursor: 'pointer' }}>
                            cancel
                          </button>
                          <button
                            onClick={() => addReply(selectedNotification.id, comment.id)}
                            disabled={!replyText.trim() || isSubmitting}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: replyText.trim() && !isSubmitting ? '#ffffff' : '#444444',
                              fontSize: '1rem',
                              cursor: replyText.trim() && !isSubmitting ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            post
                            <SouthEastArrow />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#888888' }}>no comments yet</div>
              )}
            </div>

            {/* Views */}
            <div style={{ marginTop: '3rem', fontSize: '1rem', color: '#888888' }}>viewed {selectedNotification.views} times</div>
          </div>
        </div>
      )}
    </div>
  );
}
