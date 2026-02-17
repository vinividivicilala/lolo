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
      width="24" 
      height="24" 
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
      backgroundColor: '#ffffff',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#000000'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '1rem 2rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eaeaea',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.button
            onClick={() => router.push('/notifications')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '0',
              backgroundColor: 'transparent',
              border: '1px solid #000000',
              color: '#000000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            whileHover={{ backgroundColor: '#f5f5f5' }}
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
            New Notification
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
        paddingTop: '80px',
        paddingBottom: '2rem',
        maxWidth: '640px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        padding: '6rem 1.5rem 2rem 1.5rem'
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
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter title"
              required
              style={{
                width: '100%',
                padding: '0.75rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #000000',
                color: '#000000',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Enter message"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #000000',
                color: '#000000',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Recipient Type */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Send To
            </label>
            <div style={{
              display: 'flex',
              gap: '1rem',
              borderBottom: '1px solid #eaeaea',
              paddingBottom: '0.5rem'
            }}>
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
                    padding: '0.5rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: formData.recipientType === option.value 
                      ? '2px solid #000000' 
                      : '2px solid transparent',
                    color: formData.recipientType === option.value ? '#000000' : '#999999',
                    fontSize: '0.875rem',
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
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #000000',
                    color: '#000000',
                    fontSize: '0.875rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              <div style={{
                maxHeight: '240px',
                overflowY: 'auto',
                border: '1px solid #eaeaea',
                padding: '0.5rem'
              }}>
                {isLoadingUsers ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#999999' }}>
                    Loading...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#999999' }}>
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((userItem) => {
                    const isSelected = formData.recipientIds.includes(userItem.uid);
                    return (
                      <div
                        key={userItem.uid}
                        onClick={() => toggleUserSelection(userItem.uid)}
                        style={{
                          padding: '0.75rem',
                          marginBottom: '0.25rem',
                          backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #eaeaea'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.875rem' }}>
                            {userItem.displayName || 'No name'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#999999' }}>
                            {userItem.email}
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ fontSize: '1rem' }}>✓</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {formData.recipientIds.length > 0 && (
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666666' }}>
                  Selected: {formData.recipientIds.length} users
                </div>
              )}
            </div>
          )}

          {/* Email Recipients */}
          {formData.recipientType === 'email' && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <input
                  type="email"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  placeholder="Enter email address"
                  style={{
                    flex: 1,
                    padding: '0.75rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #000000',
                    color: '#000000',
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
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#000000',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  Add
                </button>
              </div>
              
              {formData.recipientEmails.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#666666', marginBottom: '0.5rem' }}>
                    Email list:
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {formData.recipientEmails.map((email, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#f5f5f5',
                        fontSize: '0.875rem'
                      }}>
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeRecipientEmail(email)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#999999',
                            cursor: 'pointer',
                            fontSize: '1rem',
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
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Action URL (optional)
            </label>
            <input
              type="url"
              value={formData.actionUrl}
              onChange={(e) => handleInputChange('actionUrl', e.target.value)}
              placeholder="https://"
              style={{
                width: '100%',
                padding: '0.75rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #000000',
                color: '#000000',
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
            gap: '1rem',
            marginTop: '3rem'
          }}>
            <button
              type="button"
              onClick={() => router.push('/notifications')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                border: '1px solid #000000',
                color: '#000000',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isLoading ? '#cccccc' : '#000000',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.875rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
