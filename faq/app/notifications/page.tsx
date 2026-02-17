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

interface Reaction {
  type: 'like' | 'love' | 'laugh' | 'sad' | 'angry';
  count: number;
  users: string[];
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  text: string;
  createdAt: Timestamp;
  reactions: Reaction[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  text: string;
  createdAt: Timestamp;
  reactions: Reaction[];
  replies: Reply[];
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
  reactions: Reaction[];
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
  const [showReactions, setShowReactions] = useState<string | null>(null);

  // Reaction types
  const reactionTypes = [
    { type: 'like', icon: '👍' },
    { type: 'love', icon: '❤️' },
    { type: 'laugh', icon: '😂' },
    { type: 'sad', icon: '😢' },
    { type: 'angry', icon: '😠' }
  ];

  // Update current time
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
      const currentUserEmail = user?.email;
      
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.isDeleted) return;
        
        let shouldShow = false;
        
        switch (data.recipientType) {
          case 'all':
            shouldShow = true;
            break;
          case 'specific':
            const recipientIds = data.recipientIds || [];
            if (recipientIds.includes(currentUserId) || (user && recipientIds.includes(user.uid))) {
              shouldShow = true;
            }
            break;
          case 'email':
            const recipientEmails = data.recipientEmails || [];
            if (currentUserEmail && recipientEmails.includes(currentUserEmail)) {
              shouldShow = true;
            }
            break;
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
            reactions: data.reactions || reactionTypes.map(r => ({ type: r.type, count: 0, users: [] })),
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

  // Add reaction
  const addReaction = async (targetType: 'notification' | 'comment' | 'reply', targetId: string, reactionType: string, commentId?: string, replyId?: string) => {
    if (!db) return;
    
    try {
      const currentUserId = getCurrentUserId();
      let docRef;
      let updateData = {};

      if (targetType === 'notification') {
        docRef = doc(db, 'notifications', targetId);
        const notification = notifications.find(n => n.id === targetId);
        if (notification) {
          const updatedReactions = notification.reactions.map(r => {
            if (r.type === reactionType) {
              if (r.users.includes(currentUserId)) {
                return { ...r, count: r.count - 1, users: r.users.filter(id => id !== currentUserId) };
              } else {
                return { ...r, count: r.count + 1, users: [...r.users, currentUserId] };
              }
            }
            return r;
          });
          updateData = { reactions: updatedReactions };
        }
      } else if (targetType === 'comment' && commentId) {
        docRef = doc(db, 'notifications', targetId);
        const notification = notifications.find(n => n.id === targetId);
        if (notification) {
          const updatedComments = notification.comments.map(c => {
            if (c.id === commentId) {
              const updatedReactions = c.reactions.map(r => {
                if (r.type === reactionType) {
                  if (r.users.includes(currentUserId)) {
                    return { ...r, count: r.count - 1, users: r.users.filter(id => id !== currentUserId) };
                  } else {
                    return { ...r, count: r.count + 1, users: [...r.users, currentUserId] };
                  }
                }
                return r;
              });
              return { ...c, reactions: updatedReactions };
            }
            return c;
          });
          updateData = { comments: updatedComments };
        }
      } else if (targetType === 'reply' && commentId && replyId) {
        docRef = doc(db, 'notifications', targetId);
        const notification = notifications.find(n => n.id === targetId);
        if (notification) {
          const updatedComments = notification.comments.map(c => {
            if (c.id === commentId) {
              const updatedReplies = c.replies.map(r => {
                if (r.id === replyId) {
                  const updatedReactions = r.reactions.map(react => {
                    if (react.type === reactionType) {
                      if (react.users.includes(currentUserId)) {
                        return { ...react, count: react.count - 1, users: react.users.filter(id => id !== currentUserId) };
                      } else {
                        return { ...react, count: react.count + 1, users: [...react.users, currentUserId] };
                      }
                    }
                    return react;
                  });
                  return { ...r, reactions: updatedReactions };
                }
                return r;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          });
          updateData = { comments: updatedComments };
        }
      }

      if (docRef) {
        await updateDoc(docRef, updateData);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
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
        reactions: reactionTypes.map(r => ({ type: r.type, count: 0, users: [] })),
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
              userEmail: user?.email,
              text: replyText.trim(),
              createdAt: Timestamp.now(),
              reactions: reactionTypes.map(r => ({ type: r.type, count: 0, users: [] }))
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
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  // SVG Icons
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

  const ReplyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
          <span style={{ fontSize: '3rem' }}>Notifications</span>
          {unreadCount > 0 && <span style={{ fontSize: '1.5rem' }}>({unreadCount})</span>}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <span style={{ fontSize: '1.8rem' }}>{currentTime}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>{user?.displayName || user?.email || 'Visitor'}</span>
            <NorthEastArrow />
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
        <button onClick={() => router.push('/notifications/create')} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2rem', padding: 0 }}>
          Create Notification
          <SouthEastArrow />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '6rem', fontSize: '2rem' }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem', fontSize: '2rem' }}>No Notifications</div>
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
                  borderBottom: '1px solid #222222',
                  cursor: 'pointer',
                  opacity: isRead ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.5rem' }}>
                  <span>{notification.type}</span>
                  <span>{timeAgo(notification.createdAt)}</span>
                </div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{notification.title}</div>
                <div style={{ fontSize: '1.8rem', lineHeight: '1.6' }}>
                  {notification.message.length > 150 ? notification.message.substring(0, 150) + '...' : notification.message}
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.5rem' }}>
                  <span>From {notification.senderName}</span>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {notification.reactions?.map(r => r.count > 0 && (
                        <span key={r.type}>{reactionTypes.find(rt => rt.type === r.type)?.icon} {r.count}</span>
                      ))}
                    </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
              <button onClick={() => { setSelectedNotification(null); setReplyingTo(null); setShowReactions(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', padding: 0 }}>
                <NorthEastArrow />
              </button>
              <span style={{ fontSize: '1.8rem' }}>Notification</span>
              <span style={{ fontSize: '1.8rem' }}>{timeAgo(selectedNotification.createdAt)}</span>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '2rem' }}>{selectedNotification.type}</div>
              <div style={{ fontSize: '4rem', marginBottom: '3rem', lineHeight: '1.3' }}>{selectedNotification.title}</div>
              <div style={{ lineHeight: '2', marginBottom: '3rem', fontSize: '2.2rem', whiteSpace: 'pre-line' }}>{selectedNotification.message}</div>
              
              {/* Reactions */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {reactionTypes.map(reaction => {
                  const reactionData = selectedNotification.reactions?.find(r => r.type === reaction.type);
                  const count = reactionData?.count || 0;
                  const userReacted = reactionData?.users.includes(getCurrentUserId());
                  
                  return (
                    <button
                      key={reaction.type}
                      onClick={(e) => { e.stopPropagation(); addReaction('notification', selectedNotification.id, reaction.type); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: userReacted ? '#ff4444' : '#888888',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {reaction.icon} {count > 0 && count}
                    </button>
                  );
                })}
              </div>
              
              <div style={{ fontSize: '2rem' }}>— {selectedNotification.senderName}</div>
            </div>

            {/* Comments Section */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
              </div>

              {/* Comments List */}
              {selectedNotification.comments && selectedNotification.comments.length > 0 ? (
                [...selectedNotification.comments].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((comment) => (
                  <div key={comment.id} style={{ marginBottom: '3rem' }}>
                    {/* Comment */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                        <span>{comment.userName}</span>
                        <span>{timeAgo(comment.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{comment.text}</div>
                      
                      {/* Comment Reactions */}
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        {reactionTypes.map(reaction => {
                          const reactionData = comment.reactions?.find(r => r.type === reaction.type);
                          const count = reactionData?.count || 0;
                          const userReacted = reactionData?.users.includes(getCurrentUserId());
                          
                          return (
                            <button
                              key={reaction.type}
                              onClick={(e) => { e.stopPropagation(); addReaction('comment', selectedNotification.id, reaction.type, comment.id); }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: userReacted ? '#ff4444' : '#888888',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              {reaction.icon} {count > 0 && count}
                            </button>
                          );
                        })}
                      </div>

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
                          fontSize: '1.2rem'
                        }}
                      >
                        <ReplyIcon /> Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ marginLeft: '3rem' }}>
                        {comment.replies.map((reply) => (
                          <div key={reply.id} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                              <span>{reply.userName}</span>
                              <span>{timeAgo(reply.createdAt)}</span>
                            </div>
                            <div style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>{reply.text}</div>
                            
                            {/* Reply Reactions */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                              {reactionTypes.map(reaction => {
                                const reactionData = reply.reactions?.find(r => r.type === reaction.type);
                                const count = reactionData?.count || 0;
                                const userReacted = reactionData?.users.includes(getCurrentUserId());
                                
                                return (
                                  <button
                                    key={reaction.type}
                                    onClick={(e) => { e.stopPropagation(); addReaction('reply', selectedNotification.id, reaction.type, comment.id, reply.id); }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: userReacted ? '#ff4444' : '#888888',
                                      fontSize: '1.2rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.3rem'
                                    }}
                                  >
                                    {reaction.icon} {count > 0 && count}
                                  </button>
                                );
                              })}
                            </div>
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
                            fontSize: '1.5rem',
                            marginBottom: '1rem',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                          <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: '1px solid #666666', color: '#888888', fontSize: '1.2rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
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
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.5rem' }}>No comments yet</div>
              )}
            </div>

            {/* Views */}
            <div style={{ paddingTop: '2rem', fontSize: '1.5rem' }}>Viewed {selectedNotification.views} times</div>
          </div>
        </div>
      )}
    </div>
  );
}
