'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  getFirestore, 
  collection, 
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc
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

interface NotificationForm {
  title: string;
  message: string;
  type: 'announcement' | 'maintenance' | 'system' | 'update' | 'alert' | 'info';
  scheduledDate?: string;
  scheduledTime?: string;
  recipientType: 'all' | 'specific' | 'email';
  recipientIds: string[];
  recipientEmails: string[];
  actionUrl?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
}

export default function CreateNotificationPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [notificationId, setNotificationId] = useState<string>('');
  
  const [formData, setFormData] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'announcement',
    scheduledDate: '',
    scheduledTime: '',
    recipientType: 'all',
    recipientIds: [],
    recipientEmails: [],
    actionUrl: '',
    status: 'draft'
  });

  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Load all users
  useEffect(() => {
    if (!db) return;

    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.push({
            uid: doc.id,
            displayName: userData.displayName || userData.email || null,
            email: userData.email || null,
          });
        });
        
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [db]);

  const handleInputChange = (field: keyof NotificationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRecipientEmail = () => {
    if (newRecipientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipientEmail)) {
      setFormData(prev => ({
        ...prev,
        recipientEmails: [...new Set([...prev.recipientEmails, newRecipientEmail])]
      }));
      setNewRecipientEmail('');
    }
  };

  const removeRecipientEmail = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipientEmails: prev.recipientEmails.filter(e => e !== email)
    }));
  };

  const toggleUserSelection = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter(id => id !== userId)
        : [...prev.recipientIds, userId]
    }));
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (user.displayName?.toLowerCase().includes(query)) ||
      (user.email?.toLowerCase().includes(query))
    );
  });

  const saveAsDraft = async () => {
    if (!user || !db) {
      alert('Please sign in to create notifications');
      return;
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Title and message are required');
      return;
    }

    setIsLoading(true);

    try {
      const scheduledTime = formData.scheduledDate && formData.scheduledTime 
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        : null;

      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        scheduledTime: scheduledTime,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'User',
        senderEmail: user.email,
        recipientType: formData.recipientType,
        recipientIds: formData.recipientType === 'specific' ? formData.recipientIds : [],
        recipientEmails: formData.recipientType === 'email' ? formData.recipientEmails : [],
        isRead: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        actionUrl: formData.actionUrl?.trim() || '',
        userReads: {},
        status: 'draft',
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      setNotificationId(docRef.id);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !db) {
      alert('Please sign in to create notifications');
      return;
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Title and message are required');
      return;
    }

    if (formData.recipientType === 'specific' && formData.recipientIds.length === 0) {
      alert('Please select at least one user');
      return;
    }

    if (formData.recipientType === 'email' && formData.recipientEmails.length === 0) {
      alert('Please add at least one email address');
      return;
    }

    setIsLoading(true);

    try {
      const scheduledTime = formData.scheduledDate && formData.scheduledTime 
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        : null;

      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        scheduledTime: scheduledTime,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'User',
        senderEmail: user.email,
        recipientType: formData.recipientType,
        recipientIds: formData.recipientType === 'specific' ? formData.recipientIds : [],
        recipientEmails: formData.recipientType === 'email' ? formData.recipientEmails : [],
        isRead: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        actionUrl: formData.actionUrl?.trim() || '',
        userReads: {},
        status: scheduledTime ? 'scheduled' : 'sent',
        sentAt: scheduledTime ? null : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      setNotificationId(docRef.id);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/notifications');
      }, 3000);

    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    } finally {
      setIsLoading(false);
    }
  };

  // SVG South West Arrow component - Large
  const SouthWestArrow = () => (
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
      <path d="M19 5L5 19" />
      <path d="M19 19H5V5" />
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
            onClick={() => router.push('/notifications')}
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
            <SouthWestArrow />
          </motion.button>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: '700',
              margin: 0,
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              CREATE NOTIFICATION
            </h1>
            <span style={{
              fontSize: '2rem',
              fontWeight: '400',
              color: '#666666'
            }}>
              Halaman Notification
            </span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '120px',
          right: '3rem',
          backgroundColor: '#00ff00',
          color: '#000000',
          padding: '2rem 3rem',
          zIndex: 200,
          fontSize: '1.5rem',
          fontWeight: '700',
          boxShadow: '0 0 20px rgba(0,255,0,0.3)'
        }}>
          ✓ NOTIFICATION CREATED SUCCESSFULLY - ID: {notificationId}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        paddingTop: '180px',
        paddingBottom: '3rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        padding: '12rem 3rem 3rem 3rem'
      }}>
        {/* User Info Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4rem',
          padding: '1.5rem 0',
          borderBottom: '1px solid #222222'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
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
            <span style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: '#ffffff'
            }}>
              {user?.displayName || user?.email || 'USER'}
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            color: '#888888',
            fontWeight: '500'
          }}>
            {currentTime}
          </div>
        </div>

        {/* Info Status */}
        <div style={{
          marginBottom: '4rem',
          padding: '2rem',
          backgroundColor: '#111111',
          borderRadius: '0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '1.8rem',
            color: '#ffffff',
            fontWeight: '500'
          }}>
            <span>📋 SENDING NOTIFICATION AS:</span>
            <span style={{ fontWeight: '700', color: '#ffffff' }}>{user?.displayName || user?.email || 'USER'}</span>
            <span style={{ 
              marginLeft: 'auto',
              backgroundColor: formData.status === 'draft' ? '#666666' : 
                             formData.status === 'scheduled' ? '#ffaa00' : 
                             formData.status === 'sent' ? '#00ff00' : '#ff0000',
              color: '#000000',
              padding: '0.5rem 2rem',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              {formData.status === 'draft' ? 'DRAFT' : 
               formData.status === 'scheduled' ? 'SCHEDULED' : 
               formData.status === 'sent' ? 'SENT' : 'FAILED'}
            </span>
          </div>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            width: '100%'
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: '3rem' }}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="TITLE"
              required
              style={{
                width: '100%',
                padding: '1rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '2px solid #333333',
                color: '#ffffff',
                fontSize: '2.5rem',
                fontWeight: '600',
                outline: 'none',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: '3rem' }}>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="MESSAGE"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '1rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '2px solid #333333',
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: '400',
                outline: 'none',
                resize: 'vertical',
                minHeight: '150px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Notification Type */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{
              display: 'flex',
              gap: '2.5rem',
              flexWrap: 'wrap',
              borderBottom: '2px solid #333333',
              paddingBottom: '1rem'
            }}>
              {[
                { value: 'announcement', label: 'ANNOUNCEMENT' },
                { value: 'maintenance', label: 'MAINTENANCE' },
                { value: 'system', label: 'SYSTEM' },
                { value: 'update', label: 'UPDATE' },
                { value: 'alert', label: 'ALERT' },
                { value: 'info', label: 'INFO' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleInputChange('type', option.value);
                    handleInputChange('status', 'draft');
                  }}
                  style={{
                    padding: '0.5rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: formData.type === option.value ? '3px solid #ffffff' : 'none',
                    color: formData.type === option.value ? '#ffffff' : '#666666',
                    fontSize: '1.5rem',
                    fontWeight: formData.type === option.value ? '700' : '500',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Time - With dropdown selectors */}
          <div style={{ 
            marginBottom: '3rem',
            display: 'flex',
            gap: '2rem',
            borderBottom: '2px solid #333333',
            paddingBottom: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => {
                  handleInputChange('scheduledDate', e.target.value);
                  if (e.target.value || formData.scheduledTime) {
                    handleInputChange('status', 'scheduled');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '1rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.8rem',
                  fontWeight: '500',
                  outline: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  cursor: 'pointer'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => {
                  handleInputChange('scheduledTime', e.target.value);
                  if (formData.scheduledDate || e.target.value) {
                    handleInputChange('status', 'scheduled');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '1rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.8rem',
                  fontWeight: '500',
                  outline: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* Recipient Type */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{
              display: 'flex',
              gap: '2.5rem',
              borderBottom: '2px solid #333333',
              paddingBottom: '1rem'
            }}>
              {[
                { value: 'all', label: 'ALL USERS' },
                { value: 'specific', label: 'SPECIFIC USERS' },
                { value: 'email', label: 'EMAIL ADDRESSES' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleInputChange('recipientType', option.value);
                    handleInputChange('status', 'draft');
                  }}
                  style={{
                    padding: '0.5rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: formData.recipientType === option.value ? '3px solid #ffffff' : 'none',
                    color: formData.recipientType === option.value ? '#ffffff' : '#666666',
                    fontSize: '1.5rem',
                    fontWeight: formData.recipientType === option.value ? '700' : '500',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Users Selection */}
          {formData.recipientType === 'specific' && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH USERS..."
                  style={{
                    width: '100%',
                    padding: '1rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #333333',
                    color: '#ffffff',
                    fontSize: '1.8rem',
                    fontWeight: '500',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              <div style={{
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {isLoadingUsers ? (
                  <div style={{ padding: '2rem 0', color: '#888888', fontSize: '1.8rem' }}>
                    LOADING...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ padding: '2rem 0', color: '#888888', fontSize: '1.8rem' }}>
                    NO USERS FOUND
                  </div>
                ) : (
                  filteredUsers.map((userItem) => {
                    const isSelected = formData.recipientIds.includes(userItem.uid);
                    return (
                      <div
                        key={userItem.uid}
                        onClick={() => {
                          toggleUserSelection(userItem.uid);
                          handleInputChange('status', 'draft');
                        }}
                        style={{
                          padding: '1.5rem 0',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #333333'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '1.8rem', fontWeight: '600', color: '#ffffff' }}>
                            {userItem.displayName || 'NO NAME'}
                          </div>
                          <div style={{ fontSize: '1.4rem', color: '#888888' }}>
                            {userItem.email}
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 'bold' }}>✓</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {formData.recipientIds.length > 0 && (
                <div style={{ marginTop: '2rem', fontSize: '1.8rem', color: '#ffffff', fontWeight: '600' }}>
                  SELECTED: {formData.recipientIds.length} USERS
                </div>
              )}
            </div>
          )}

          {/* Email Recipients */}
          {formData.recipientType === 'email' && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <input
                  type="email"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  placeholder="ENTER EMAIL ADDRESS"
                  style={{
                    flex: 1,
                    padding: '1rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #333333',
                    color: '#ffffff',
                    fontSize: '1.8rem',
                    fontWeight: '500',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRecipientEmail();
                      handleInputChange('status', 'draft');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    addRecipientEmail();
                    handleInputChange('status', 'draft');
                  }}
                  style={{
                    padding: '1rem 3rem',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    color: '#000000',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  ADD
                </button>
              </div>
              
              {formData.recipientEmails.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: '700', marginBottom: '1.5rem' }}>
                    EMAIL LIST:
                  </div>
                  <div>
                    {formData.recipientEmails.map((email, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 0',
                        fontSize: '1.8rem',
                        borderBottom: '1px solid #333333'
                      }}>
                        <span style={{ flex: 1, color: '#ffffff', fontWeight: '500' }}>{email}</span>
                        <button
                          type="button"
                          onClick={() => {
                            removeRecipientEmail(email);
                            handleInputChange('status', 'draft');
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            padding: '0',
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action URL */}
          <div style={{ marginBottom: '3rem' }}>
            <input
              type="url"
              value={formData.actionUrl}
              onChange={(e) => {
                handleInputChange('actionUrl', e.target.value);
                handleInputChange('status', 'draft');
              }}
              placeholder="ACTION URL (OPTIONAL)"
              style={{
                width: '100%',
                padding: '1rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '2px solid #333333',
                color: '#ffffff',
                fontSize: '1.8rem',
                fontWeight: '500',
                outline: 'none',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '3rem',
            marginTop: '5rem'
          }}>
            <button
              type="button"
              onClick={saveAsDraft}
              disabled={isLoading}
              style={{
                padding: '1rem 3rem',
                backgroundColor: 'transparent',
                border: '2px solid #666666',
                color: '#ffffff',
                fontSize: '1.8rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              SAVE AS DRAFT
            </button>

            <button
              type="button"
              onClick={() => router.push('/notifications')}
              style={{
                padding: '1rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#888888',
                fontSize: '2rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              CANCEL
            </button>
            
            <motion.button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '1rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: isLoading ? '#444444' : '#ffffff',
                fontSize: '2rem',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
            >
              {isLoading ? 'SENDING...' : 'SEND NOTIFICATION'}
              <SouthEastArrow />
            </motion.button>
          </div>

          {/* Status Info */}
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            backgroundColor: '#111111',
            display: 'flex',
            gap: '3rem',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#666666' }}></div>
              <span style={{ fontSize: '1.4rem' }}>DRAFT - Saved but not sent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ffaa00' }}></div>
              <span style={{ fontSize: '1.4rem' }}>SCHEDULED - Will be sent at selected time</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#00ff00' }}></div>
              <span style={{ fontSize: '1.4rem' }}>SENT - Notification has been sent</span>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
