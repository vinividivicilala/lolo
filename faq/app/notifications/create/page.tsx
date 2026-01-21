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
  where,
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
  type: 'system' | 'announcement' | 'alert' | 'update' | 'comment' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipientType: 'all' | 'specific' | 'email_only' | 'app_only';
  recipientIds: string[];
  recipientEmails: string[];
  actionUrl?: string;
  icon: string;
  color: string;
}

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  providerId?: string;
  createdAt?: any;
}

export default function CreateNotificationPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const [formData, setFormData] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'announcement',
    priority: 'medium',
    recipientType: 'all',
    recipientIds: [],
    recipientEmails: [],
    actionUrl: '',
    icon: '📢',
    color: '#0050B7'
  });

  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin email yang diizinkan
  const ADMIN_EMAILS = [
    'faridardiansyah061@gmail.com',
    // Tambahkan email admin lainnya di sini
  ];

  // Check if user is admin
  const checkIsAdmin = (email: string | null) => {
    return email && ADMIN_EMAILS.includes(email);
  };

  // Load user data dan cek admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = checkIsAdmin(currentUser.email);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // Redirect jika bukan admin
          router.push('/notifications');
        }
      } else {
        // Redirect ke login jika belum login
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, []);

  // Load all users from Firestore (termasuk anonymous)
  useEffect(() => {
    if (!db || !isAdmin) return;

    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        // Load users from Firestore collection 'users'
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.push({
            uid: doc.id,
            displayName: userData.displayName || userData.email || 'Anonymous User',
            email: userData.email || 'No Email',
            photoURL: userData.photoURL || null,
            providerId: userData.providerId || 'unknown',
            createdAt: userData.createdAt
          });
        });
        
        // If no users in Firestore, use dummy data
        if (usersData.length === 0) {
          const dummyUsers: User[] = [
            { uid: 'anonymous-1', displayName: 'Anonymous User 1', email: 'anonymous@example.com', providerId: 'anonymous' },
            { uid: 'google-1', displayName: 'Google User', email: 'google@example.com', providerId: 'google.com' },
            { uid: 'github-1', displayName: 'GitHub User', email: 'github@example.com', providerId: 'github.com' },
          ];
          setUsers(dummyUsers);
        } else {
          setUsers(usersData);
        }
        
      } catch (error) {
        console.error("Error loading users:", error);
        // Fallback to dummy data if error
        const dummyUsers: User[] = [
          { uid: 'anonymous-1', displayName: 'Anonymous User 1', email: 'anonymous@example.com', providerId: 'anonymous' },
          { uid: 'google-1', displayName: 'Google User', email: 'google@example.com', providerId: 'google.com' },
          { uid: 'github-1', displayName: 'GitHub User', email: 'github@example.com', providerId: 'github.com' },
        ];
        setUsers(dummyUsers);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [db, isAdmin]);

  // Handle form input changes
  const handleInputChange = (field: keyof NotificationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add recipient email
  const addRecipientEmail = () => {
    if (newRecipientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipientEmail)) {
      setFormData(prev => ({
        ...prev,
        recipientEmails: [...new Set([...prev.recipientEmails, newRecipientEmail])]
      }));
      setNewRecipientEmail('');
    }
  };

  // Remove recipient email
  const removeRecipientEmail = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipientEmails: prev.recipientEmails.filter(e => e !== email)
    }));
  };

  // Add recipient user
  const addRecipientUser = (user: User) => {
    setFormData(prev => ({
      ...prev,
      recipientIds: [...new Set([...prev.recipientIds, user.uid])]
    }));
  };

  // Remove recipient user
  const removeRecipientUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.filter(id => id !== userId)
    }));
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (user.displayName?.toLowerCase().includes(query)) ||
      (user.email?.toLowerCase().includes(query))
    );
  });

  // Get icon options based on type
  const getIconOptions = (type: string) => {
    const icons: Record<string, string[]> = {
      system: ['🔄', '⚙️', '🔧', '🛠️', '💻'],
      announcement: ['📢', '📯', '🗣️', '🎉', '📰'],
      alert: ['⚠️', '🚨', '🔴', '⛔', '🚩'],
      update: ['🆕', '✨', '🌟', '⭐', '💫'],
      comment: ['💬', '🗨️', '👥', '💭', '📝'],
      personal: ['👤', '🎯', '💌', '📮', '✉️']
    };
    return icons[type] || ['📌'];
  };

  // Get color options based on priority
  const getColorOptions = (priority: string) => {
    const colors: Record<string, string[]> = {
      urgent: ['#FF4757', '#FF3838', '#FF2E2E'],
      high: ['#FF6B6B', '#FF7675', '#FF7979'],
      medium: ['#FFA502', '#FFA726', '#FFB74D'],
      low: ['#2ED573', '#32CD32', '#7BED9F']
    };
    return colors[priority] || ['#0050B7', '#6366F1', '#8B78E6'];
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !db || !isAdmin) {
      alert('Admin access required');
      return;
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Title and message are required');
      return;
    }

    // Validasi untuk specific recipients
    if (formData.recipientType === 'specific' && formData.recipientIds.length === 0) {
      alert('Please select at least one user for specific notification');
      return;
    }

    // Validasi untuk email recipients
    if (formData.recipientType === 'email_only' && formData.recipientEmails.length === 0) {
      alert('Please add at least one email address for email notification');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Save notification to Firestore
      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        priority: formData.priority,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Admin',
        senderEmail: user.email,
        senderPhotoURL: user.photoURL || null,
        recipientType: formData.recipientType,
        recipientIds: formData.recipientType === 'specific' ? formData.recipientIds : [],
        recipientEmails: formData.recipientType === 'email_only' ? formData.recipientEmails : [],
        isRead: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        actionUrl: formData.actionUrl?.trim() || '',
        icon: formData.icon,
        color: formData.color,
        userReads: {} // Untuk melacak pembacaan per user
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notification saved with ID:', docRef.id);

      // 2. Success message
      alert('Notification created successfully!');
      
      // 3. Reset form
      setFormData({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'medium',
        recipientType: 'all',
        recipientIds: [],
        recipientEmails: [],
        actionUrl: '',
        icon: '📢',
        color: '#0050B7'
      });

      // 4. Redirect to notifications page
      router.push('/notifications');

    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Jika bukan admin, tampilkan akses ditolak
  if (user && !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: 'white'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Access Denied
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '2rem',
            maxWidth: '400px'
          }}>
            Only administrators can create notifications. Please contact the system administrator.
          </p>
          <motion.button
            onClick={() => router.push('/notifications')}
            style={{
              padding: '0.8rem 1.5rem',
              backgroundColor: '#0050B7',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Notifications
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '1rem 2rem',
        backgroundColor: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
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
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ←
          </motion.button>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            margin: 0
          }}>
            Create Notification
          </h1>
          <span style={{
            backgroundColor: '#00FF00',
            color: 'black',
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            marginLeft: '0.5rem'
          }}>
            ADMIN MODE
          </span>
        </div>
        
        <div style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.6)'
        }}>
          Admin: {user?.displayName || user?.email}
        </div>
      </div>

      {/* Main Form */}
      <div style={{
        paddingTop: '80px',
        paddingBottom: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        padding: '2rem'
      }}>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(30, 30, 30, 0.5)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Form Header */}
          <div style={{
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: formData.color,
              margin: '0 auto 1rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem'
            }}>
              {formData.icon}
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 0 0.5rem 0'
            }}>
              Admin Notification Panel
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              fontSize: '0.9rem'
            }}>
              Send notifications to all users (including anonymous)
            </p>
          </div>

          {/* Basic Information */}
          <div style={{
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              color: 'white',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              Basic Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Title */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter notification title"
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Message */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Enter notification message"
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '120px',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div style={{
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              color: 'white',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              Notification Settings
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Type */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="system">System</option>
                  <option value="announcement">Announcement</option>
                  <option value="alert">Alert</option>
                  <option value="update">Update</option>
                  <option value="comment">Comment</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Icon and Color Selection */}
            <div style={{
              marginTop: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Icon Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Icon
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {getIconOptions(formData.type).map((icon) => (
                    <motion.button
                      key={icon}
                      type="button"
                      onClick={() => handleInputChange('icon', icon)}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        backgroundColor: formData.icon === icon ? formData.color : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {icon}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Color
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {getColorOptions(formData.priority).map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        backgroundColor: color,
                        border: formData.color === color ? '3px solid white' : 'none',
                        cursor: 'pointer'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Settings */}
          <div style={{
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              color: 'white',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              Recipient Settings
            </h3>

            {/* Recipient Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.8)'
              }}>
                Send To *
              </label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {[
                  { value: 'all', label: 'All Users', desc: 'All registered users (Gmail, GitHub, Anonymous)' },
                  { value: 'specific', label: 'Specific Users', desc: 'Select specific users' },
                  { value: 'email_only', label: 'Email Addresses', desc: 'Manual email list' },
                  { value: 'app_only', label: 'App Only', desc: 'In-app notification only' }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('recipientType', option.value)}
                    style={{
                      padding: '0.8rem 1rem',
                      backgroundColor: formData.recipientType === option.value 
                        ? formData.color 
                        : 'rgba(255,255,255,0.05)',
                      border: formData.recipientType === option.value 
                        ? `1px solid ${formData.color}` 
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: formData.recipientType === option.value ? 'white' : 'rgba(255,255,255,0.8)',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      flex: 1,
                      minWidth: '150px'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div style={{ fontWeight: '600' }}>{option.label}</div>
                    <div style={{
                      fontSize: '0.8rem',
                      opacity: 0.8,
                      marginTop: '0.2rem'
                    }}>
                      {option.desc}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Specific User Selection */}
            {formData.recipientType === 'specific' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Select Users *
                </label>
                
                {/* Search Users */}
                <div style={{
                  marginBottom: '1rem'
                }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Users List */}
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(0,0,0,0.3)'
                }}>
                  {isLoadingUsers ? (
                    <div style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.5)'
                    }}>
                      Loading users...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.5)'
                    }}>
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelected = formData.recipientIds.includes(user.uid);
                      return (
                        <motion.div
                          key={user.uid}
                          onClick={() => {
                            if (isSelected) {
                              removeRecipientUser(user.uid);
                            } else {
                              addRecipientUser(user);
                            }
                          }}
                          style={{
                            padding: '0.8rem',
                            marginBottom: '0.5rem',
                            backgroundColor: isSelected 
                              ? 'rgba(0, 80, 183, 0.3)' 
                              : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isSelected ? '#0050B7' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          whileHover={{ backgroundColor: isSelected 
                            ? 'rgba(0, 80, 183, 0.4)' 
                            : 'rgba(255,255,255,0.1)' 
                          }}
                        >
                          <div>
                            <div style={{
                              fontWeight: '600',
                              color: 'white'
                            }}>
                              {user.displayName || 'No Name'}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              color: 'rgba(255,255,255,0.6)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span>{user.email}</span>
                              <span style={{
                                fontSize: '0.7rem',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                padding: '0.1rem 0.3rem',
                                borderRadius: '3px'
                              }}>
                                {user.providerId || 'unknown'}
                              </span>
                            </div>
                          </div>
                          <div style={{
                            color: isSelected ? '#00FF00' : 'rgba(255,255,255,0.3)',
                            fontSize: '1.2rem'
                          }}>
                            {isSelected ? '✓' : '+'}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Selected Users */}
                {formData.recipientIds.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '0.5rem'
                    }}>
                      Selected Users: {formData.recipientIds.length}
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {formData.recipientIds.map((userId, index) => {
                        const user = users.find(u => u.uid === userId);
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'rgba(0, 80, 183, 0.3)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '15px'
                          }}>
                            <span style={{
                              fontSize: '0.8rem',
                              color: '#0050B7'
                            }}>
                              {user?.displayName?.substring(0, 15) || `User ${index + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeRecipientUser(userId)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#FF4757',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email Recipients */}
            {formData.recipientType === 'email_only' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Email Addresses *
                </label>
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
                      padding: '0.8rem 1rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRecipientEmail();
                      }
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={addRecipientEmail}
                    style={{
                      padding: '0.8rem 1.2rem',
                      backgroundColor: formData.color,
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Email
                  </motion.button>
                </div>
                
                {formData.recipientEmails.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '0.5rem'
                    }}>
                      Email List: {formData.recipientEmails.length} addresses
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
                          backgroundColor: 'rgba(46, 213, 115, 0.2)',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '15px'
                        }}>
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#2ED573'
                          }}>
                            {email}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRecipientEmail(email)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#FF4757',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: '0.5rem'
                }}>
                  Note: Email notifications will be sent via Firebase Cloud Functions (requires setup)
                </div>
              </div>
            )}
          </div>

          {/* Action URL */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.8)'
            }}>
              Action URL (Optional)
            </label>
            <input
              type="url"
              value={formData.actionUrl}
              onChange={(e) => handleInputChange('actionUrl', e.target.value)}
              placeholder="https://example.com/action"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <div style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '0.5rem'
            }}>
              Users can click this URL from the notification
            </div>
          </div>

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <motion.button
              type="button"
              onClick={() => router.push('/notifications')}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: isLoading ? '#666' : formData.color,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              whileHover={!isLoading ? { scale: 1.05 } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Sending...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Notification
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* Admin Info Section */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 0, 0.3)'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            margin: '0 0 1rem 0',
            color: '#00FF00',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FF00" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Admin Information
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '1.5rem',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem',
            lineHeight: 1.6
          }}>
            <li>Only administrators with authorized emails can create notifications</li>
            <li>Current admin email: <strong>{user?.email}</strong></li>
            <li>Notifications are stored permanently in Firebase and visible to all users</li>
            <li>For email notifications, you need to set up Firebase Cloud Functions</li>
            <li>All notifications are logged with admin information</li>
          </ul>
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
