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

// Emoticon List untuk Reactions
const EMOTICONS = [
  { id: 'like', emoji: '👍', label: 'Suka' },
  { id: 'heart', emoji: '❤️', label: 'Cinta' },
  { id: 'laugh', emoji: '😂', label: 'Lucu' },
  { id: 'wow', emoji: '😮', label: 'Kagum' },
  { id: 'sad', emoji: '😢', label: 'Sedih' },
  { id: 'angry', emoji: '😠', label: 'Marah' }
];

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  text: string;
  createdAt: Timestamp;
  likes: number;
  likedBy: string[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  text: string;
  createdAt: Timestamp;
  likes: number;
  likedBy: string[];
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
  likes: string[];
  comments: Comment[];
  status?: string;
  reactions?: Record<string, number>;
}

export default function NotificationsPage(): React.JSX.Element {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  // Reaction states
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [notificationReactions, setNotificationReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);

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

  // Get current user photo
  const getCurrentUserPhoto = () => {
    if (user?.photoURL) return user.photoURL;
    return `https://ui-avatars.com/api/?name=${getCurrentUserName()}&background=random&color=fff`;
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
            status: data.status || 'sent',
            reactions: data.reactions || {}
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

  // Load user reactions for selected notification
  useEffect(() => {
    if (!selectedNotification || !user) return;
    
    const loadUserReactions = async () => {
      try {
        const reactionKey = `user_${user.uid}_${selectedNotification.id}`;
        const saved = localStorage.getItem(reactionKey);
        if (saved) {
          setUserReactions(JSON.parse(saved));
        } else {
          setUserReactions([]);
        }
      } catch (error) {
        console.error("Error loading user reactions:", error);
      }
    };
    
    loadUserReactions();
  }, [selectedNotification, user]);

  // Set notification reactions when selected notification changes
  useEffect(() => {
    if (selectedNotification?.reactions) {
      setNotificationReactions(selectedNotification.reactions);
    } else {
      setNotificationReactions({});
    }
  }, [selectedNotification]);

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
  const toggleNotificationLike = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!db) return;
    if (!user) {
      alert('Silakan login untuk menyukai notifikasi');
      return;
    }
    
    try {
      const currentUserId = getCurrentUserId();
      const notificationRef = doc(db, 'notifications', notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (!notification) return;
      
      if (notification.likes.includes(currentUserId)) {
        // Unlike
        await updateDoc(notificationRef, {
          likes: arrayRemove(currentUserId)
        });
      } else {
        // Like
        await updateDoc(notificationRef, {
          likes: arrayUnion(currentUserId)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handle reaction (emoticon)
  const handleReaction = async (emoticonId: string) => {
    if (!db || !selectedNotification) return;
    if (!user) {
      alert('Silakan login untuk memberikan reaksi');
      return;
    }
    
    try {
      const notificationRef = doc(db, 'notifications', selectedNotification.id);
      const reactionKey = `reactions.${emoticonId}`;
      const currentCount = notificationReactions[emoticonId] || 0;
      
      if (userReactions.includes(emoticonId)) {
        // Remove reaction
        await updateDoc(notificationRef, {
          [reactionKey]: currentCount - 1
        });
        
        const newUserReactions = userReactions.filter(id => id !== emoticonId);
        setUserReactions(newUserReactions);
        localStorage.setItem(`user_${user.uid}_${selectedNotification.id}`, JSON.stringify(newUserReactions));
        
        setNotificationReactions(prev => ({
          ...prev,
          [emoticonId]: currentCount - 1
        }));
      } else {
        // Add reaction
        await updateDoc(notificationRef, {
          [reactionKey]: currentCount + 1
        });
        
        const newUserReactions = [...userReactions, emoticonId];
        setUserReactions(newUserReactions);
        localStorage.setItem(`user_${user.uid}_${selectedNotification.id}`, JSON.stringify(newUserReactions));
        
        setNotificationReactions(prev => ({
          ...prev,
          [emoticonId]: currentCount + 1
        }));
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  // Add comment
  const addComment = async (notificationId: string) => {
    if (!db || !commentText.trim()) return;
    if (!user) {
      alert('Silakan login untuk berkomentar');
      return;
    }
    
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
        userPhoto: getCurrentUserPhoto(),
        text: commentText.trim(),
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
        replies: []
      };
      
      await updateDoc(notificationRef, {
        comments: arrayUnion(newComment)
      });
      
      setCommentText('');
      setShowCommentForm(false);
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
    if (!user) {
      alert('Silakan login untuk membalas');
      return;
    }
    
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
              userPhoto: getCurrentUserPhoto(),
              text: replyText.trim(),
              createdAt: Timestamp.now(),
              likes: 0,
              likedBy: []
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
      alert('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle like on comment or reply
  const toggleLike = async (
    notificationId: string, 
    commentId: string, 
    replyId?: string,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!db) return;
    if (!user) {
      alert('Silakan login untuk menyukai');
      return;
    }
    
    try {
      const currentUserId = getCurrentUserId();
      const notificationRef = doc(db, 'notifications', notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (!notification) return;
      
      const updatedComments = notification.comments.map(comment => {
        if (comment.id === commentId) {
          if (replyId) {
            // Toggle like on reply
            const updatedReplies = comment.replies.map(reply => {
              if (reply.id === replyId) {
                const likedBy = reply.likedBy || [];
                const likes = reply.likes || 0;
                
                if (likedBy.includes(currentUserId)) {
                  return { 
                    ...reply, 
                    likes: likes - 1,
                    likedBy: likedBy.filter(id => id !== currentUserId)
                  };
                } else {
                  return { 
                    ...reply, 
                    likes: likes + 1,
                    likedBy: [...likedBy, currentUserId]
                  };
                }
              }
              return reply;
            });
            return { ...comment, replies: updatedReplies };
          } else {
            // Toggle like on comment
            const likedBy = comment.likedBy || [];
            const likes = comment.likes || 0;
            
            if (likedBy.includes(currentUserId)) {
              return { 
                ...comment, 
                likes: likes - 1,
                likedBy: likedBy.filter(id => id !== currentUserId)
              };
            } else {
              return { 
                ...comment, 
                likes: likes + 1,
                likedBy: [...likedBy, currentUserId]
              };
            }
          }
        }
        return comment;
      });
      
      await updateDoc(notificationRef, {
        comments: updatedComments
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
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

  // SVG Components
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

  // Like Icon seperti YouTube (Thumbs Up)
  const LikeIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );

  const CommentIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const ReplyIcon = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <polyline points="10 11 13 14 10 17"/>
    </svg>
  );

  const SendIcon = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
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

      {/* Content - Tanpa Animasi */}
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
                  opacity: isRead ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem'
                }}
              >
                {/* North East Arrow untuk setiap post */}
                <NorthEastArrow />
                
                <div style={{ flex: 1 }}>
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
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LikeIcon filled={isLiked} />
                        <span>{notification.likes?.length || 0}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CommentIcon />
                        <span>{notification.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal - Tanpa Animasi */}
      {selectedNotification && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000000',
            padding: '3rem',
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
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
                  setShowCommentForm(false);
                  setShowEmoticonPicker(false);
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
                    color: selectedNotification.likes.includes(getCurrentUserId()) ? '#3b82f6' : '#ffffff',
                    fontSize: '2rem',
                    cursor: user ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <LikeIcon filled={selectedNotification.likes.includes(getCurrentUserId())} />
                  <span>{selectedNotification.likes?.length || 0}</span>
                </button>
              </div>
            </div>

            {/* EMOTICON REACTIONS SECTION */}
            <div style={{
              marginTop: '40px',
              marginBottom: '40px',
              borderTop: '1px solid #333333',
              paddingTop: '40px',
            }}>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '30px',
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'normal',
                  color: 'white',
                  margin: 0,
                }}>
                  Reaksi
                </h3>
                
                <button
                  onClick={() => setShowEmoticonPicker(!showEmoticonPicker)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '30px',
                    padding: '12px 24px',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: user ? 'pointer' : 'default',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>😊</span>
                  <span>Tambahkan Reaksi</span>
                </button>
              </div>

              {/* Emoticon Picker */}
              {showEmoticonPicker && (
                <div
                  style={{
                    marginBottom: '30px',
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '12px',
                    padding: '24px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {EMOTICONS.map((emoticon) => (
                      <button
                        key={emoticon.id}
                        onClick={() => {
                          handleReaction(emoticon.id);
                          setShowEmoticonPicker(false);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          background: userReactions.includes(emoticon.id) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                          border: userReactions.includes(emoticon.id) ? '1px solid white' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          padding: '16px 8px',
                          cursor: user ? 'pointer' : 'default',
                        }}
                      >
                        <span style={{ fontSize: '2.5rem' }}>{emoticon.emoji}</span>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: userReactions.includes(emoticon.id) ? 'white' : '#999999' 
                        }}>
                          {emoticon.label}
                        </span>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          color: 'white',
                          fontWeight: 'bold' 
                        }}>
                          {notificationReactions[emoticon.id] || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Reactions Summary */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
              }}>
                {Object.entries(notificationReactions)
                  .filter(([_, count]) => count > 0)
                  .sort(([_, a], [__, b]) => b - a)
                  .map(([id, count]) => {
                    const emoticon = EMOTICONS.find(e => e.id === id);
                    if (!emoticon) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => handleReaction(id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: userReactions.includes(id) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                          border: userReactions.includes(id) ? '1px solid white' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '30px',
                          padding: '8px 16px',
                          cursor: user ? 'pointer' : 'default',
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{emoticon.emoji}</span>
                        <span style={{ 
                          fontSize: '0.95rem', 
                          color: 'white' 
                        }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* COMMENTS SECTION */}

            {/* Add Comment Button */}
            <button
              onClick={() => {
                if (!user) {
                  alert('Silakan login untuk berkomentar');
                } else {
                  setShowCommentForm(!showCommentForm);
                }
              }}
              style={{
                width: '100%',
                padding: '20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed #444444',
                borderRadius: '16px',
                color: user ? '#999999' : 'white',
                fontSize: '1.1rem',
                cursor: 'pointer',
                marginBottom: '40px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {user ? 'Tulis komentar Anda di sini...' : 'Login untuk menulis komentar'}
            </button>

            {/* Comment Form */}
            {showCommentForm && user && (
              <div style={{ marginBottom: '40px' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                  }}>
                    <img 
                      src={getCurrentUserPhoto()}
                      alt={getCurrentUserName()}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <div>
                      <span style={{ 
                        color: 'white', 
                        fontSize: '1.2rem',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {getCurrentUserName()}
                      </span>
                      <span style={{ color: '#666666', fontSize: '0.9rem' }}>
                        Berkomentar sebagai pengguna
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Apa pendapat Anda tentang notifikasi ini?"
                    rows={5}
                    style={{
                      padding: '20px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid #333333',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '1.1rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '15px',
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowCommentForm(false)}
                      style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: '1px solid #333333',
                        borderRadius: '30px',
                        color: '#999999',
                        fontSize: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => addComment(selectedNotification.id)}
                      disabled={isSubmitting || !commentText.trim()}
                      style={{
                        padding: '12px 32px',
                        background: isSubmitting || !commentText.trim() ? '#333333' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '30px',
                        color: isSubmitting || !commentText.trim() ? '#999999' : 'white',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: isSubmitting || !commentText.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <SendIcon />
                      <span>{isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'normal',
                  color: 'white',
                  margin: 0,
                }}>
                  Komentar
                </h3>
                <span style={{
                  fontSize: '1.2rem',
                  color: '#666666',
                }}>
                  {selectedNotification.comments?.length || 0} komentar
                </span>
              </div>

              {selectedNotification.comments && selectedNotification.comments.length > 0 ? (
                [...selectedNotification.comments]
                  .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                  .map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        padding: '24px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {/* Comment Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                        }}>
                          <img 
                            src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=random&color=fff`}
                            alt={comment.userName}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid rgba(255,255,255,0.1)',
                            }}
                          />
                          <div>
                            <span style={{
                              fontSize: '1.2rem',
                              fontWeight: '500',
                              color: 'white',
                              display: 'block',
                              marginBottom: '4px',
                            }}>
                              {comment.userName}
                            </span>
                            <span style={{
                              fontSize: '0.9rem',
                              color: '#666666',
                            }}>
                              {timeAgo(comment.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Comment Like Button */}
                        <button
                          onClick={(e) => toggleLike(selectedNotification.id, comment.id, undefined, e)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: (comment.likedBy || []).includes(getCurrentUserId()) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                            border: (comment.likedBy || []).includes(getCurrentUserId()) ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '30px',
                            padding: '8px 16px',
                            cursor: user ? 'pointer' : 'not-allowed',
                            color: (comment.likedBy || []).includes(getCurrentUserId()) ? '#3b82f6' : 'white',
                          }}
                        >
                          <LikeIcon filled={(comment.likedBy || []).includes(getCurrentUserId())} />
                          <span style={{ fontSize: '1rem' }}>
                            {comment.likes || 0}
                          </span>
                        </button>
                      </div>

                      {/* Comment Content */}
                      <p style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.7',
                        color: '#e0e0e0',
                        margin: '10px 0 5px 0',
                        paddingLeft: '15px',
                        borderLeft: '2px solid rgba(255,255,255,0.1)',
                      }}>
                        {comment.text}
                      </p>

                      {/* Reply Button */}
                      <button
                        onClick={() => {
                          if (!user) {
                            alert('Silakan login untuk membalas');
                          } else {
                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'none',
                          border: 'none',
                          color: '#666666',
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          padding: '8px 0',
                          marginTop: '5px',
                        }}
                      >
                        <ReplyIcon />
                        <span>Balas komentar</span>
                      </button>

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div
                          style={{
                            marginTop: '15px',
                            marginLeft: '30px',
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '15px',
                          }}>
                            <img 
                              src={getCurrentUserPhoto()}
                              alt={getCurrentUserName()}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                            <div style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Tulis balasan Anda..."
                                rows={3}
                                style={{
                                  padding: '15px',
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid #333333',
                                  borderRadius: '16px',
                                  color: 'white',
                                  fontSize: '0.95rem',
                                  outline: 'none',
                                  resize: 'vertical',
                                }}
                              />
                              <div style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end',
                              }}>
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  style={{
                                    padding: '8px 16px',
                                    background: 'none',
                                    border: '1px solid #333333',
                                    borderRadius: '20px',
                                    color: '#999999',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => addReply(selectedNotification.id, comment.id)}
                                  disabled={!replyText.trim() || isSubmitting}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 24px',
                                    background: replyText.trim() && !isSubmitting ? 'rgba(255,255,255,0.1)' : '#333333',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '20px',
                                    color: replyText.trim() && !isSubmitting ? 'white' : '#999999',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    cursor: replyText.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  <ReplyIcon />
                                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Balasan'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies List */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div style={{
                          marginTop: '20px',
                          marginLeft: '30px',
                          paddingLeft: '20px',
                          borderLeft: '2px solid rgba(255,255,255,0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                        }}>
                          {comment.replies.map((reply: any) => (
                            <div
                              key={reply.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                gap: '12px',
                                flex: 1,
                              }}>
                                <img 
                                  src={reply.userPhoto || `https://ui-avatars.com/api/?name=${reply.userName}&background=random&color=fff`}
                                  alt={reply.userName}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '5px',
                                  }}>
                                    <span style={{
                                      fontSize: '1rem',
                                      fontWeight: '500',
                                      color: 'white',
                                    }}>
                                      {reply.userName}
                                    </span>
                                    <span style={{
                                      fontSize: '0.8rem',
                                      color: '#666666',
                                    }}>
                                      {timeAgo(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p style={{
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    color: '#e0e0e0',
                                    margin: '0 0 8px 0',
                                  }}>
                                    {reply.text}
                                  </p>
                                  <button
                                    onClick={(e) => toggleLike(selectedNotification.id, comment.id, reply.id, e)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      background: 'none',
                                      border: 'none',
                                      color: (reply.likedBy || []).includes(getCurrentUserId()) ? '#3b82f6' : '#666666',
                                      fontSize: '0.85rem',
                                      cursor: user ? 'pointer' : 'not-allowed',
                                      padding: '4px 8px',
                                      borderRadius: '20px',
                                      backgroundColor: (reply.likedBy || []).includes(getCurrentUserId()) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    }}
                                  >
                                    <LikeIcon filled={(reply.likedBy || []).includes(getCurrentUserId())} />
                                    <span>{reply.likes || 0}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div
                  style={{
                    padding: '60px',
                    textAlign: 'center',
                    color: '#666666',
                    border: '1px dashed #333333',
                    borderRadius: '24px',
                  }}
                >
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>💬</span>
                  <p style={{ fontSize: '1.2rem', margin: 0 }}>Belum ada komentar.</p>
                  <p style={{ fontSize: '1rem', color: '#999999', marginTop: '10px' }}>
                    Jadilah yang pertama untuk berdiskusi!
                  </p>
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
