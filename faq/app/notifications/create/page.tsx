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

  // SVG North West Arrow component - Large
  const NorthWestArrow = () => (
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
        padding: '2rem',
        backgroundColor: '#000000',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
            <NorthWestArrow />
          </motion.button>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            margin: 0,
            color: '#ffffff'
          }}>
            Notifikasi
          </h1>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            color: '#ffffff'
          }}>
            {user?.displayName || user?.email || 'User'}
          </span>
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
        </div>
      </div>

      {/* Main Form */}
      <div style={{
        paddingTop: '140px',
        paddingBottom: '3rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        padding: '8rem 2rem 3rem 2rem'
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
              placeholder="Judul"
              required
              style={{
                width: '100%',
                padding: '0.75rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: '500',
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
              placeholder="Pesan"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.2rem',
                fontWeight: '400',
                outline: 'none',
                resize: 'vertical',
                minHeight: '120px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Notification Type */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              {[
                { value: 'announcement', label: 'Pengumuman' },
                { value: 'maintenance', label: 'Pemeliharaan' },
                { value: 'system', label: 'Sistem' },
                { value: 'update', label: 'Pembaruan' },
                { value: 'alert', label: 'Peringatan' },
                { value: 'info', label: 'Informasi' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('type', option.value)}
                  style={{
                    padding: '0.75rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: formData.type === option.value ? '#ffffff' : '#666666',
                    fontSize: '1.2rem',
                    fontWeight: formData.type === option.value ? '600' : '400',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Time */}
          <div style={{ 
            marginBottom: '2.5rem',
            display: 'flex',
            gap: '2rem'
          }}>
            <div style={{ flex: 1 }}>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  fontWeight: '400',
                  outline: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}
              />
            </div>
          </div>

          {/* Recipient Type */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              display: 'flex',
              gap: '2rem'
            }}>
              {[
                { value: 'all', label: 'Semua Pengguna' },
                { value: 'specific', label: 'Pengguna Tertentu' },
                { value: 'email', label: 'Alamat Email' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('recipientType', option.value)}
                  style={{
                    padding: '0.75rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: formData.recipientType === option.value ? '#ffffff' : '#666666',
                    fontSize: '1.2rem',
                    fontWeight: formData.recipientType === option.value ? '600' : '400',
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
                  placeholder="Cari Pengguna..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: '400',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              <div style={{
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {isLoadingUsers ? (
                  <div style={{ padding: '1rem 0', color: '#999999', fontSize: '1.2rem' }}>
                    Memuat...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ padding: '1rem 0', color: '#999999', fontSize: '1.2rem' }}>
                    Tidak Ada Pengguna
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
                          opacity: 1,
                          borderBottom: '1px solid #222222'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '1.2rem', fontWeight: '500', color: '#ffffff' }}>
                            {userItem.displayName || 'Tanpa Nama'}
                          </div>
                          <div style={{ fontSize: '1rem', color: '#999999' }}>
                            {userItem.email}
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 'bold' }}>✓</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {formData.recipientIds.length > 0 && (
                <div style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#ffffff', fontWeight: '500' }}>
                  Dipilih: {formData.recipientIds.length} Pengguna
                </div>
              )}
            </div>
          )}

          {/* Email Recipients */}
          {formData.recipientType === 'email' && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <input
                  type="email"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  placeholder="Masukkan Alamat Email"
                  style={{
                    flex: 1,
                    padding: '0.75rem 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: '400',
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
                    padding: '0.75rem 2rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  Tambah
                </button>
              </div>
              
              {formData.recipientEmails.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '600', marginBottom: '1rem' }}>
                    Daftar Email:
                  </div>
                  <div>
                    {formData.recipientEmails.map((email, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 0',
                        fontSize: '1.2rem',
                        borderBottom: '1px solid #222222'
                      }}>
                        <span style={{ flex: 1, color: '#ffffff', fontWeight: '400' }}>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeRecipientEmail(email)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '2rem',
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
          <div style={{ marginBottom: '2.5rem' }}>
            <input
              type="url"
              value={formData.actionUrl}
              onChange={(e) => handleInputChange('actionUrl', e.target.value)}
              placeholder="URL Tindakan (Opsional)"
              style={{
                width: '100%',
                padding: '0.75rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.2rem',
                fontWeight: '400',
                outline: 'none',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '2rem',
            marginTop: '4rem'
          }}>
            <button
              type="button"
              onClick={() => router.push('/notifications')}
              style={{
                padding: '0.75rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#999999',
                fontSize: '1.5rem',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              Batal
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: isLoading ? '#666666' : '#ffffff',
                fontSize: '1.5rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              {isLoading ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
