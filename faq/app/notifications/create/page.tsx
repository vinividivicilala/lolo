'use client';

import React, { useState, useEffect } from "react";
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
  });

  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      router.push('/notifications');

    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    } finally {
      setIsLoading(false);
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
          <span style={{ fontSize: '2rem' }}>Create Notification</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ fontSize: '1.2rem', color: '#888888' }}>
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{user?.displayName || user?.email || 'Visitor'}</span>
            <NorthEastArrow />
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Type Selection */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            'Announcement',
            'Maintenance',
            'System',
            'Update',
            'Alert',
            'Info'
          ].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleInputChange('type', label.toLowerCase())}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: 'transparent',
                border: formData.type === label.toLowerCase() ? '1px solid #ffffff' : '1px solid #333333',
                color: '#ffffff',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Title"
            required
            style={{
              width: '100%',
              padding: '0.8rem 0',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid #333333',
              color: '#ffffff',
              fontSize: '1.5rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: '2rem' }}>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Message"
            required
            rows={6}
            style={{
              width: '100%',
              padding: '0.8rem 0',
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
            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
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
            onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
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
            { value: 'all', label: 'All Users' },
            { value: 'specific', label: 'Specific Users' },
            { value: 'email', label: 'Email Addresses' }
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
              placeholder="Search Users"
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
              {isLoadingUsers ? (
                <div style={{ padding: '1rem', color: '#888888' }}>Loading...</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding: '1rem', color: '#888888' }}>No Users Found</div>
              ) : (
                filteredUsers.map((userItem) => (
                  <div
                    key={userItem.uid}
                    onClick={() => toggleUserSelection(userItem.uid)}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      backgroundColor: formData.recipientIds.includes(userItem.uid) ? '#333333' : '#111111',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    {userItem.displayName || userItem.email || 'No Name'}
                  </div>
                ))
              )}
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
                placeholder="Email Address"
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
                  backgroundColor: '#333333',
                  border: '1px solid #ffffff',
                  color: '#ffffff',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Add
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
                    color: '#888888',
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
            placeholder="Action Url (Optional)"
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
            onClick={() => router.push('/notifications')}
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: '1px solid #333333',
              color: '#888888',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: '1px solid #ffffff',
              color: isLoading ? '#888888' : '#ffffff',
              fontSize: '1.2rem',
              cursor: isLoading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
            <SouthEastArrow />
          </button>
        </div>
      </form>
    </div>
  );
}
