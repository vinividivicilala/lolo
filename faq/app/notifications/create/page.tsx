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
  orderBy
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

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 60000);
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

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return '#4a90e2';
      case 'maintenance': return '#f5a623';
      case 'system': return '#9013fe';
      case 'update': return '#7ed321';
      case 'alert': return '#d0021b';
      case 'info': return '#4a90e2';
      default: return '#4a90e2';
    }
  };

  // SVG North East Arrow
  const NorthEastArrow = () => (
    <svg 
      width="48" 
      height="48" 
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

  // SVG South East Arrow
  const SouthEastArrow = () => (
    <svg 
      width="48" 
      height="48" 
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
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => router.push('/notifications')}
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
          <span style={{ fontSize: '2.5rem' }}>create notification</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ fontSize: '1.2rem', color: '#888888' }}>{currentTime}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{user?.displayName || user?.email || 'visitor'}</span>
            <NorthEastArrow />
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#7ed321',
          color: '#000000',
          padding: '2rem 4rem',
          zIndex: 200,
          fontSize: '1.5rem'
        }}>
          notification created
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Type Selection */}
        <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { value: 'announcement', label: 'announcement' },
            { value: 'maintenance', label: 'maintenance' },
            { value: 'system', label: 'system' },
            { value: 'update', label: 'update' },
            { value: 'alert', label: 'alert' },
            { value: 'info', label: 'info' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                handleInputChange('type', option.value);
                handleInputChange('status', 'draft');
              }}
              style={{
                padding: '0.8rem 2rem',
                backgroundColor: formData.type === option.value ? getTypeColor(option.value) : 'transparent',
                border: '1px solid #333333',
                color: formData.type === option.value ? '#000000' : '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="title"
            required
            style={{
              width: '100%',
              padding: '1rem 0',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid #333333',
              color: '#ffffff',
              fontSize: '2rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: '2rem' }}>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="message"
            required
            rows={6}
            style={{
              width: '100%',
              padding: '1rem 0',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid #333333',
              color: '#ffffff',
              fontSize: '1.2rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Schedule */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <input
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => {
              handleInputChange('scheduledDate', e.target.value);
              if (e.target.value) handleInputChange('status', 'scheduled');
            }}
            style={{
              flex: 1,
              padding: '0.8rem',
              backgroundColor: '#111111',
              border: '1px solid #333333',
              color: '#ffffff',
              fontSize: '1rem'
            }}
          />
          <input
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => {
              handleInputChange('scheduledTime', e.target.value);
              if (e.target.value) handleInputChange('status', 'scheduled');
            }}
            style={{
              flex: 1,
              padding: '0.8rem',
              backgroundColor: '#111111',
              border: '1px solid #333333',
              color: '#ffffff',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Recipient Type */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          {[
            { value: 'all', label: 'all users' },
            { value: 'specific', label: 'specific users' },
            { value: 'email', label: 'email addresses' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleInputChange('recipientType', option.value)}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: 'transparent',
                border: formData.recipientType === option.value ? '1px solid #ffffff' : '1px solid #333333',
                color: '#ffffff',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Specific Users */}
        {formData.recipientType === 'specific' && (
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search users"
              style={{
                width: '100%',
                padding: '0.8rem',
                backgroundColor: '#111111',
                border: '1px solid #333333',
                color: '#ffffff',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            />
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredUsers.map((userItem) => (
                <div
                  key={userItem.uid}
                  onClick={() => toggleUserSelection(userItem.uid)}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    backgroundColor: formData.recipientIds.includes(userItem.uid) ? '#7ed321' : '#111111',
                    color: formData.recipientIds.includes(userItem.uid) ? '#000000' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {userItem.displayName || userItem.email || 'unknown'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Recipients */}
        {formData.recipientType === 'email' && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="email"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
                placeholder="email address"
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  backgroundColor: '#111111',
                  border: '1px solid #333333',
                  color: '#ffffff',
                  fontSize: '1rem'
                }}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipientEmail())}
              />
              <button
                type="button"
                onClick={addRecipientEmail}
                style={{
                  padding: '0.8rem 2rem',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  color: '#000000',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                add
              </button>
            </div>
            {formData.recipientEmails.map((email, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8rem',
                backgroundColor: '#111111',
                marginBottom: '0.5rem'
              }}>
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => removeRecipientEmail(email)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d0021b',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action URL */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="url"
            value={formData.actionUrl}
            onChange={(e) => handleInputChange('actionUrl', e.target.value)}
            placeholder="action url (optional)"
            style={{
              width: '100%',
              padding: '0.8rem',
              backgroundColor: '#111111',
              border: '1px solid #333333',
              color: '#ffffff',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          <button
            type="button"
            onClick={saveAsDraft}
            disabled={isLoading}
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: '1px solid #666666',
              color: '#ffffff',
              fontSize: '1.2rem',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            save draft
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/notifications')}
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: 'none',
              color: '#888888',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: 'none',
              color: isLoading ? '#444444' : '#ffffff',
              fontSize: '1.2rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? 'sending' : 'send'}
            <SouthEastArrow />
          </button>
        </div>
      </form>
    </div>
  );
}
