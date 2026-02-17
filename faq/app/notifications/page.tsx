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
  arrayUnion,
  arrayRemove,
  increment as firestoreIncrement
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

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
  userEmail?: string;
  text: string;
  createdAt: Timestamp;
  likes: string[];
  emoji?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  text: string;
  createdAt: Timestamp;
  likes: string[];
  replies: Reply[];
  emoji?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  recipientType: 'all' | 'specific' | 'email';
  recipientIds?: string[];
  recipientEmails?: string[];
  createdAt: Timestamp;
  userReads: Record<string, boolean>;
  views: number;
  likes: string[];
  comments: Comment[];
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
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
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

  // Get current user name
  const getCurrentUserName = () => {
    if (user) {
      return user.displayName || user.email?.split('@')[0] || 'User';
    }
    let anonymousName = localStorage.getItem('anonymous_name');
    if (!anonymousName) {
      anonymousName = 'Anonymous ' + Math.floor(Math.random() * 1000);
      localStorage.setItem('anonymous_name', anonymousName);
    }
    return anonymousName;
  };

  // Load notifications - FILTERED BY USER
  useEffect(() => {
    if (!db) return;

    setIsLoading(true);
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: Notification[] = [];
      let unread = 0;
      const currentUserId = getCurrentUserId();
      const currentUserEmail = user?.email;
      
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.isDeleted) return;
        
        // Determine if this notification should be shown to current user
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
            const recipientEmails = data.recipientEmails || [];
            if (currentUserEmail && recipientEmails.includes(currentUserEmail)) {
              shouldShow = true;
            }
            break;
            
          default:
            shouldShow = false;
        }
        
        if (shouldShow) {
          const notification = {
            id: doc.id,
            title: data.title || '',
            message: data.message || '',
            type: data.type || 'info',
            senderId: data.senderId || '',
            senderName: data.senderName || 'System',
            senderEmail: data.senderEmail,
            recipientType: data.recipientType || 'all',
            recipientIds: data.recipientIds || [],
            recipientEmails: data.recipientEmails || [],
            createdAt: data.createdAt || Timestamp.now(),
            userReads: data.userReads || {},
            views: data.views || 0,
            likes: data.likes || [],
            comments: data.comments || [],
            status: data.status || 'sent'
          };
          
          if (!notification.userReads[currentUserId]) {
            unread++;
          }
          
          notificationsData.push(notification);
        }
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

  // Toggle like on notification
  const toggleNotificationLike = async (notificationId: string) => {
    if (!db) return;
    
    try {
      const currentUserId = getCurrentUserId();
      const notificationRef = doc(db, 'notifications', notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification?.likes.includes(currentUserId)) {
        await updateDoc(notificationRef, {
          likes: arrayRemove(currentUserId)
        });
      } else {
        await updateDoc(notificationRef, {
          likes: arrayUnion(currentUserId)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
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
        userEmail: user?.email,
        text: commentText.trim(),
        createdAt: Timestamp.now(),
        likes: [],
        replies: []
      };
      
      await updateDoc(notificationRef, {
        comments: arrayUnion(newComment)
      });
      
      setCommentText('');
      setShowEmojiPicker(null);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert('Failed to add comment');
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
              userEmail: user?.email,
              text: replyText.trim(),
              createdAt: Timestamp.now(),
              likes: []
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
      setShowEmojiPicker(null);
    } catch (error) {
      console.error("Error adding reply:", error);
      alert('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle like on comment or reply
  const toggleLike = async (
    notificationId: string, 
    commentId: string, 
    replyId?: string
  ) => {
    if (!db) return;
    
    try {
      const currentUserId = getCurrentUserId();
      const notificationRef = doc(db, 'notifications', notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification) {
        const updatedComments = notification.comments.map(comment => {
          if (comment.id === commentId) {
            if (replyId) {
              // Toggle like on reply
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === replyId) {
                  const likes = reply.likes.includes(currentUserId)
                    ? reply.likes.filter(id => id !== currentUserId)
                    : [...reply.likes, currentUserId];
                  return { ...reply, likes };
                }
                return reply;
              });
              return { ...comment, replies: updatedReplies };
            } else {
              // Toggle like on comment
              const likes = comment.likes.includes(currentUserId)
                ? comment.likes.filter(id => id !== currentUserId)
                : [...comment.likes, currentUserId];
              return { ...comment, likes };
            }
          }
          return comment;
        });
        
        await updateDoc(notificationRef, {
          comments: updatedComments
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Add emoji to comment/reply
  const addEmoji = (emoji: any, target: string) => {
    if (target === 'comment') {
      setCommentText(prev => prev + emoji.native);
    } else {
      setReplyText(prev => prev + emoji.native);
    }
    setShowEmojiPicker(null);
  };

  // Format time ago
  const timeAgo = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // SVG North East Arrow
  const NorthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
    >
      <path d="M7 7L17 17" />
      <path d="M7 17V7H17" />
    </svg>
  );

  // SVG South East Arrow
  const SouthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
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
        marginBottom: '4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: 0
            }}
          >
            <NorthEastArrow />
          </button>
          <span style={{ fontSize: '3rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{ fontSize: '1.5rem' }}>({unreadCount})</span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <span style={{ fontSize: '1.8rem' }}>{currentTime}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>
              {user?.displayName || user?.email || 'Visitor'}
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
          Create Notification
          <SouthEastArrow />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '6rem', fontSize: '2rem' }}>
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '6rem', 
          fontSize: '2rem'
        }}>
          No Notifications
        </div>
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {notifications.map((notification) => {
            const isRead = notification.userReads[getCurrentUserId()];
            const isLiked = notification.likes.includes(getCurrentUserId());
            
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
                  fontSize: '1.5rem'
                }}>
                  <span>{notification.type}</span>
                  <span>{timeAgo(notification.createdAt)}</span>
                </div>
                <div style={{ 
                  fontSize: '2.2rem', 
                  marginBottom: '1rem'
                }}>
                  {notification.title}
                </div>
                <div style={{ 
                  fontSize: '1.8rem',
                  lineHeight: '1.6'
                }}>
                  {notification.message.length > 150 
                    ? notification.message.substring(0, 150) + '...' 
                    : notification.message}
                </div>
                <div style={{ 
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1.5rem'
                }}>
                  <span>From {notification.senderName}</span>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <span>❤️ {notification.likes?.length || 0}</span>
                    <span>💬 {notification.comments?.length || 0}</span>
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
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4rem'
            }}>
              <button
                onClick={() => {
                  setSelectedNotification(null);
                  setReplyingTo(null);
                  setShowEmojiPicker(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ffffff',
                  padding: 0
                }}
              >
                <NorthEastArrow />
              </button>
              <span style={{ fontSize: '1.8rem' }}>Notification</span>
              <span style={{ fontSize: '1.8rem' }}>
                {timeAgo(selectedNotification.createdAt)}
              </span>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                marginBottom: '2rem'
              }}>
                {selectedNotification.type}
              </div>
              
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '3rem',
                lineHeight: '1.3'
              }}>
                {selectedNotification.title}
              </div>
              
              <div style={{ 
                lineHeight: '2', 
                marginBottom: '3rem',
                fontSize: '2.2rem',
                whiteSpace: 'pre-line'
              }}>
                {selectedNotification.message}
              </div>
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '2rem'
              }}>
                <span>— {selectedNotification.senderName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNotificationLike(selectedNotification.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: selectedNotification.likes.includes(getCurrentUserId()) ? '#ff4444' : '#ffffff',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {selectedNotification.likes.includes(getCurrentUserId()) ? '❤️' : '🤍'}
                  <span>{selectedNotification.likes?.length || 0}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span>Comments</span>
                <span>({selectedNotification.comments?.length || 0})</span>
              </div>

              {/* Add Comment */}
              <div style={{ marginBottom: '3rem' }}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#111111',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    resize: 'vertical'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={() => setShowEmojiPicker('comment')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '2rem',
                      cursor: 'pointer'
                    }}
                  >
                    😊
                  </button>
                  <button
                    onClick={() => addComment(selectedNotification.id)}
                    disabled={!commentText.trim() || isSubmitting}
                    style={{
                      background: 'none',
                      border: '1px solid #ffffff',
                      color: commentText.trim() && !isSubmitting ? '#ffffff' : '#666666',
                      fontSize: '1.5rem',
                      padding: '1rem 3rem',
                      cursor: commentText.trim() && !isSubmitting ? 'pointer' : 'default'
                    }}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
                {showEmojiPicker === 'comment' && (
                  <div style={{ marginTop: '1rem' }}>
                    <Picker 
                      data={data} 
                      onEmojiSelect={(emoji: any) => addEmoji(emoji, 'comment')}
                      theme="dark"
                    />
                  </div>
                )}
              </div>

              {/* Comments List */}
              {selectedNotification.comments && selectedNotification.comments.length > 0 ? (
                [...selectedNotification.comments]
                  .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                  .map((comment) => (
                    <div key={comment.id} style={{
                      marginBottom: '2rem'
                    }}>
                      {/* Comment */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                          fontSize: '1.2rem'
                        }}>
                          <span>{comment.userName}</span>
                          <span>{timeAgo(comment.createdAt)}</span>
                        </div>
                        <div style={{ 
                          fontSize: '1.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          {comment.text}
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '2rem',
                          fontSize: '1.2rem'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(selectedNotification.id, comment.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: comment.likes.includes(getCurrentUserId()) ? '#ff4444' : '#888888',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            {comment.likes.includes(getCurrentUserId()) ? '❤️' : '🤍'}
                            {comment.likes?.length || 0}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyingTo(comment.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#888888',
                              cursor: 'pointer'
                            }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div style={{ marginLeft: '3rem' }}>
                          {comment.replies.map((reply) => (
                            <div key={reply.id} style={{
                              marginBottom: '1rem'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem',
                                fontSize: '1.2rem'
                              }}>
                                <span>{reply.userName}</span>
                                <span>{timeAgo(reply.createdAt)}</span>
                              </div>
                              <div style={{ 
                                fontSize: '1.5rem',
                                marginBottom: '0.5rem'
                              }}>
                                {reply.text}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLike(selectedNotification.id, comment.id, reply.id);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: reply.likes.includes(getCurrentUserId()) ? '#ff4444' : '#888888',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '1.2rem'
                                }}
                              >
                                {reply.likes.includes(getCurrentUserId()) ? '❤️' : '🤍'}
                                {reply.likes?.length || 0}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div style={{ marginTop: '1rem', marginLeft: '3rem' }}>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows={2}
                            style={{
                              width: '100%',
                              padding: '1rem',
                              background: '#111111',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '1.2rem',
                              marginBottom: '1rem',
                              resize: 'vertical'
                            }}
                          />
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <button
                              onClick={() => setShowEmojiPicker(`reply-${comment.id}`)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ffffff',
                                fontSize: '2rem',
                                cursor: 'pointer'
                              }}
                            >
                              😊
                            </button>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                              <button
                                onClick={() => setReplyingTo(null)}
                                style={{
                                  background: 'none',
                                  border: '1px solid #666666',
                                  color: '#888888',
                                  fontSize: '1.2rem',
                                  padding: '0.5rem 1.5rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => addReply(selectedNotification.id, comment.id)}
                                disabled={!replyText.trim() || isSubmitting}
                                style={{
                                  background: 'none',
                                  border: '1px solid #ffffff',
                                  color: replyText.trim() && !isSubmitting ? '#ffffff' : '#666666',
                                  fontSize: '1.2rem',
                                  padding: '0.5rem 1.5rem',
                                  cursor: replyText.trim() && !isSubmitting ? 'pointer' : 'default'
                                }}
                              >
                                {isSubmitting ? 'Posting...' : 'Reply'}
                              </button>
                            </div>
                          </div>
                          {showEmojiPicker === `reply-${comment.id}` && (
                            <div style={{ marginTop: '1rem' }}>
                              <Picker 
                                data={data} 
                                onEmojiSelect={(emoji: any) => addEmoji(emoji, 'reply')}
                                theme="dark"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.5rem' }}>
                  No comments yet
                </div>
              )}
            </div>

            {/* Views */}
            <div style={{ 
              paddingTop: '2rem',
              fontSize: '1.5rem'
            }}>
              Viewed {selectedNotification.views} times
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
