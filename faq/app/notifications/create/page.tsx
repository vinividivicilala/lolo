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
      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
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
        userReads: {}
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      alert('Notification created successfully');
      router.push('/notifications');

    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    } finally {
      setIsLoading(false);
    }
  };

  // SVG North West Arrow component
  const NorthWestArrow = () => (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M17 17L7 7" />
      <path d="M7 17V7H17" />
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
        padding: '1.5rem 2rem',
        backgroundColor: '#000000',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.button
            onClick={() => router.push('/notifications')}
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.95 }}
          >
            <NorthWestArrow />
          </motion.button>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '400',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            new notification
          </h1>
        </div>
        
        <div style={{
          fontSize: '0.875rem',
          color: '#666666'
        }}>
          {user?.displayName || user?.email}
        </div>
      </div>

      {/* Main Form */}
      <div style={{
        paddingTop: '100px',
        paddingBottom: '2rem',
        maxWidth: '640px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        padding: '6rem 2rem 2rem 2rem'
      }}>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            width: '100%'
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: '2.5rem' }}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="title"
              required
              style={{
                width: '100%',
                padding: '0.5rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: '2.5rem' }}>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="message"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '120px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Recipient Type */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              display: 'flex',
              gap: '2rem'
            }}>
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
                    padding: '0.5rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: formData.recipientType === option.value ? '#ffffff' : '#333333',
                    fontSize: '1rem',
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
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search users..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              <div style={{
                maxHeight: '240px',
                overflowY: 'auto'
              }}>
                {isLoadingUsers ? (
                  <div style={{ padding: '1rem 0', color: '#666666' }}>
                    loading...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ padding: '1rem 0', color: '#666666' }}>
                    no users found
                  </div>
                ) : (
                  filteredUsers.map((userItem) => {
                    const isSelected = formData.recipientIds.includes(userItem.uid);
                    return (
                      <div
                        key={userItem.uid}
                        onClick={() => toggleUserSelection(userItem.uid)}
                        style={{
                          padding: '1rem 0',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: isSelected ? 1 : 0.7
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.875rem' }}>
                            {userItem.displayName || 'no name'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                            {userItem.email}
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ fontSize: '1rem', color: '#ffffff' }}>✓</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {formData.recipientIds.length > 0 && (
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666666' }}>
                  selected: {formData.recipientIds.length} users
                </div>
              )}
            </div>
          )}

          {/* Email Recipients */}
          {formData.recipientType === 'email' && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <input
                  type="email"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  placeholder="enter email address"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRecipientEmail();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addRecipientEmail}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#666666',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  add
                </button>
              </div>
              
              {formData.recipientEmails.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#666666', marginBottom: '0.5rem' }}>
                    email list:
                  </div>
                  <div>
                    {formData.recipientEmails.map((email, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0',
                        fontSize: '0.875rem'
                      }}>
                        <span style={{ flex: 1, color: '#ffffff' }}>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeRecipientEmail(email)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#666666',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            padding: '0'
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
          <div style={{ marginBottom: '2.5rem' }}>
            <input
              type="url"
              value={formData.actionUrl}
              onChange={(e) => handleInputChange('actionUrl', e.target.value)}
              placeholder="action url (optional)"
              style={{
                width: '100%',
                padding: '0.5rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1.5rem',
            marginTop: '3rem'
          }}>
            <button
              type="button"
              onClick={() => router.push('/notifications')}
              style={{
                padding: '0.5rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#666666',
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.5rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: isLoading ? '#333333' : '#ffffff',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              {isLoading ? 'sending...' : 'send'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
