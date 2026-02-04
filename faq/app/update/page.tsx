'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  where,
  getDoc
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

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

interface Update {
  id?: string;
  title: string;
  category: string;
  description: string;
  version: string;
  status: 'pending' | 'in-progress' | 'completed' | 'deployed';
  userId: string;
  userName: string;
  createdAt: any;
  updatedAt: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'minor' | 'moderate' | 'major' | 'critical';
}

interface Message {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  userEmail?: string;
  updateId?: string;
  type: 'text' | 'comment' | 'update';
  createdAt: any;
}

interface Notification {
  id?: string;
  type: 'update' | 'comment' | 'mention';
  updateId?: string;
  messageId?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName?: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: any;
}

export default function UpdatesPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [updates, setUpdates] = useState<Update[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewUpdateForm, setShowNewUpdateForm] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newUpdate, setNewUpdate] = useState({ 
    title: "", 
    category: "", 
    description: "",
    version: "",
    priority: "medium" as 'low' | 'medium' | 'high' | 'critical',
    impact: "moderate" as 'minor' | 'moderate' | 'major' | 'critical',
    status: "pending" as 'pending' | 'in-progress' | 'completed' | 'deployed'
  });
  const [newMessage, setNewMessage] = useState("");
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = [
    "Frontend",
    "Backend", 
    "Database",
    "Security",
    "UI/UX",
    "Performance",
    "API",
    "Mobile",
    "DevOps",
    "Feature",
    "Bug Fix",
    "Optimization",
    "Integration",
    "Migration",
    "Maintenance"
  ];

  const statusColors: Record<string, string> = {
    'pending': '#FFB800',
    'in-progress': '#00C2FF',
    'completed': '#00DC82',
    'deployed': '#8B5CF6'
  };

  const priorityColors: Record<string, string> = {
    'low': '#6B7280',
    'medium': '#3B82F6',
    'high': '#F59E0B',
    'critical': '#EF4444'
  };

  const impactColors: Record<string, string> = {
    'minor': '#6B7280',
    'moderate': '#10B981',
    'major': '#F59E0B',
    'critical': '#EF4444'
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      
      setAuth(authInstance);
      setDb(dbInstance);
      
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || 
                    currentUser.email?.split('@')[0] || 
                    'User';
        const email = currentUser.email || '';
        setUserDisplayName(name);
        setUserEmail(email);
        
        await saveUserToFirestore(currentUser.uid, name, email);
        
        loadUpdates();
        loadMessages();
        loadUserNotifications(currentUser.uid);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const saveUserToFirestore = async (userId: string, name: string, email: string) => {
    if (!db) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      const userData = {
        id: userId,
        name: name,
        email: email.toLowerCase(),
        role: 'developer',
        lastActive: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (!userSnap.exists()) {
        await setDoc(userRef, userData);
      } else {
        await updateDoc(userRef, {
          ...userData,
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
    }
  };

  const loadUpdates = () => {
    if (!db) {
      console.log('Database not ready yet');
      return;
    }
    
    setIsLoading(true);
    try {
      const updatesRef = collection(db, 'updates');
      const q = query(updatesRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const updatesData: Update[] = [];
        querySnapshot.forEach((doc) => {
          const updateData = doc.data() as Update;
          updatesData.push({
            id: doc.id,
            ...updateData
          });
        });
        setUpdates(updatesData);
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading updates:", error);
      setIsLoading(false);
      return () => {};
    }
  };

  const loadMessages = () => {
    if (!db) return;

    try {
      const messagesRef = collection(db, 'updateMessages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'), where('type', '==', 'text'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesData: Message[] = [];
        querySnapshot.forEach((doc) => {
          const messageData = doc.data() as Message;
          messagesData.push({
            id: doc.id,
            ...messageData
          });
        });
        setMessages(messagesData);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadUserNotifications = (userId: string) => {
    if (!db) return;

    try {
      const notificationsRef = collection(db, 'updateNotifications');
      const q = query(
        notificationsRef, 
        where('receiverId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const notificationsData: Notification[] = [];
        for (const docSnap of querySnapshot.docs) {
          const notificationData = docSnap.data() as Notification;
          
          notificationsData.push({
            id: docSnap.id,
            ...notificationData
          });
        }
        setNotifications(notificationsData);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleCreateUpdate = async () => {
    if (!user || !db || !newUpdate.title.trim()) {
      alert("Judul update harus diisi");
      return;
    }

    try {
      const updateData = {
        title: newUpdate.title.trim(),
        category: newUpdate.category.trim(),
        description: newUpdate.description.trim(),
        version: newUpdate.version.trim(),
        priority: newUpdate.priority,
        impact: newUpdate.impact,
        status: newUpdate.status,
        userId: user.uid,
        userName: userDisplayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'updates'), updateData);
      
      // Create system notification
      await addDoc(collection(db, 'updateNotifications'), {
        type: 'update',
        updateId: docRef.id,
        senderId: user.uid,
        senderName: userDisplayName,
        receiverId: 'all',
        message: `Update baru: "${newUpdate.title.trim()}" telah dibuat`,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      
      setNewUpdate({ 
        title: "", 
        category: "", 
        description: "",
        version: "",
        priority: "medium",
        impact: "moderate",
        status: "pending"
      });
      setShowNewUpdateForm(false);
      
    } catch (error) {
      console.error("Error creating update:", error);
      alert("Gagal membuat update. Silakan coba lagi.");
    }
  };

  const handleUpdateStatus = async (updateId: string, newStatus: Update['status']) => {
    if (!user || !db) return;

    try {
      const updateRef = doc(db, 'updates', updateId);
      await updateDoc(updateRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      const update = updates.find(u => u.id === updateId);
      if (update) {
        await addDoc(collection(db, 'updateNotifications'), {
          type: 'update',
          updateId: updateId,
          senderId: user.uid,
          senderName: userDisplayName,
          receiverId: 'all',
          message: `Status update "${update.title}" diubah menjadi ${newStatus}`,
          status: 'unread',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!db) return;
    
    if (confirm("Apakah Anda yakin ingin menghapus update ini?")) {
      try {
        await deleteDoc(doc(db, 'updates', updateId));
      } catch (error) {
        console.error("Error deleting update:", error);
        alert("Gagal menghapus update.");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!user || !db || !newMessage.trim()) {
      alert("Pesan tidak boleh kosong");
      return;
    }

    try {
      const messageData = {
        text: newMessage.trim(),
        userId: user.uid,
        userName: userDisplayName,
        userEmail: userEmail,
        type: 'text' as const,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'updateMessages'), messageData);
      
      // Notify mentions
      const mentionRegex = /@(\w+)/g;
      let match;
      while ((match = mentionRegex.exec(newMessage)) !== null) {
        const mentionedUser = match[1];
        // Find user by display name (simplified)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', mentionedUser));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const mentionedUserDoc = querySnapshot.docs[0];
          await addDoc(collection(db, 'updateNotifications'), {
            type: 'mention',
            senderId: user.uid,
            senderName: userDisplayName,
            receiverId: mentionedUserDoc.id,
            receiverName: mentionedUserDoc.data().name,
            message: `${userDisplayName} menyebut Anda dalam pesan`,
            status: 'unread',
            createdAt: serverTimestamp()
          });
        }
      }
      
      setNewMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Gagal mengirim pesan.");
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    if (!db) return;

    try {
      const notificationRef = doc(db, 'updateNotifications', notificationId);
      await updateDoc(notificationRef, {
        status: 'read'
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes}m yang lalu`;
    if (diffHours < 24) return `${diffHours}j yang lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays}h yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingNotifications = notifications.filter(n => n.status === 'unread');
  const notificationCount = pendingNotifications.length;

  const getStatusStats = () => {
    return {
      total: updates.length,
      pending: updates.filter(u => u.status === 'pending').length,
      inProgress: updates.filter(u => u.status === 'in-progress').length,
      completed: updates.filter(u => u.status === 'completed').length,
      deployed: updates.filter(u => u.status === 'deployed').length
    };
  };

  const stats = getStatusStats();

  if (!auth || !db) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '20px'
      }}>
        Loading...
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
      color: 'white',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'black',
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Judul Website */}
        <div style={{
          fontSize: '42px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          color: 'white',
          letterSpacing: '1px',
          cursor: 'pointer'
        }} onClick={() => router.push('/')}>
          Menuru
        </div>

        {/* Nama User dan Tombol */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* Nama User dengan South East Arrow */}
          <div style={{
            fontSize: '32px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {userDisplayName}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </div>
          
          {/* Tombol Notifikasi */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
              title="Notifikasi"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {notificationCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {notificationCount}
                </div>
              )}
            </button>

            {/* Dropdown Notifikasi */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                width: '400px',
                maxHeight: '500px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #333',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  Notifikasi ({notifications.length})
                </div>
                
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#888',
                    fontSize: '18px'
                  }}>
                    Tidak ada notifikasi
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        style={{
                          padding: '20px',
                          borderBottom: '1px solid #222',
                          backgroundColor: notification.status === 'unread' ? 'rgba(255,255,255,0.05)' : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => notification.id && handleMarkNotificationAsRead(notification.id)}
                      >
                        <div style={{
                          fontSize: '18px',
                          marginBottom: '10px',
                          color: notification.status === 'unread' ? 'white' : '#aaa'
                        }}>
                          {notification.message}
                        </div>
                        
                        <div style={{
                          fontSize: '14px',
                          color: '#666',
                          marginBottom: '10px'
                        }}>
                          Dari: {notification.senderName || 'System'}
                          <br />
                          Waktu: {formatTime(notification.createdAt)}
                        </div>
                        
                        {notification.status === 'unread' && (
                          <div style={{
                            color: '#00C2FF',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            Baru
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Tombol Kirim Pesan */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{
              fontSize: '20px',
              color: 'white'
            }}>
              Kirim Pesan
            </span>
            <button
              onClick={() => setShowMessageModal(true)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Kirim Pesan"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7H17V17"/>
            </svg>
          </div>
          
          {/* Tombol Buat Update Baru dengan Teks */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{
              fontSize: '20px',
              color: 'white'
            }}>
              Buat Update
            </span>
            <button
              onClick={() => setShowNewUpdateForm(true)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px'
              }}
              title="Buat Update Baru"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7H17V17"/>
            </svg>
          </div>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Logout"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '160px 20px 100px',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '40px'
      }}>
        {/* Updates Column */}
        <div>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '15px',
            marginBottom: '50px'
          }}>
            {[
              { label: 'Total', value: stats.total, color: '#FFFFFF' },
              { label: 'Pending', value: stats.pending, color: statusColors.pending },
              { label: 'Progress', value: stats.inProgress, color: statusColors['in-progress'] },
              { label: 'Completed', value: stats.completed, color: statusColors.completed },
              { label: 'Deployed', value: stats.deployed, color: statusColors.deployed }
            ].map((stat, index) => (
              <div key={index} style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid ${stat.color}40`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: stat.color,
                  marginBottom: '5px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '100px',
              fontSize: '26px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: 'white'
            }}>
              Memuat update...
            </div>
          ) : updates.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '120px 20px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <div style={{
                fontSize: '32px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                color: 'white',
                marginBottom: '20px'
              }}>
                Belum ada update
              </div>
              <div style={{
                fontSize: '24px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                color: 'white'
              }}>
                Buat update pertama Anda
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              {updates.map((update) => (
                <div
                  key={update.id}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '30px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '6px 16px',
                    backgroundColor: statusColors[update.status] + '20',
                    border: `1px solid ${statusColors[update.status]}40`,
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: statusColors[update.status],
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    {update.status}
                  </div>

                  {/* Priority and Impact Badges */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      padding: '4px 12px',
                      backgroundColor: priorityColors[update.priority] + '20',
                      border: `1px solid ${priorityColors[update.priority]}40`,
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: priorityColors[update.priority],
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>
                      {update.priority}
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      backgroundColor: impactColors[update.impact] + '20',
                      border: `1px solid ${impactColors[update.impact]}40`,
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: impactColors[update.impact],
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>
                      {update.impact}
                    </div>
                  </div>

                  {/* Category */}
                  {update.category && (
                    <div style={{
                      fontSize: '18px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '10px',
                      fontWeight: '500'
                    }}>
                      {update.category}
                    </div>
                  )}

                  {/* Title */}
                  <div style={{
                    fontSize: '32px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: '1.3',
                    color: 'white',
                    fontWeight: 'bold',
                    marginBottom: '15px'
                  }}>
                    {update.title}
                  </div>

                  {/* Version */}
                  {update.version && (
                    <div style={{
                      fontSize: '18px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: '#00C2FF',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="2">
                        <path d="M2 12h20M12 2v20"/>
                      </svg>
                      Version: {update.version}
                    </div>
                  )}

                  {/* Description */}
                  {update.description && (
                    <div style={{
                      fontSize: '20px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      lineHeight: '1.6',
                      color: 'rgba(255,255,255,0.8)',
                      marginTop: '20px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {update.description}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(0,194,255,0.2)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#00C2FF'
                        }}>
                          {update.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span style={{
                          fontSize: '16px',
                          color: 'rgba(255,255,255,0.6)'
                        }}>
                          oleh {update.userName}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '16px',
                        color: 'rgba(255,255,255,0.4)'
                      }}>
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      {/* Status Update Buttons */}
                      <select
                        value={update.status}
                        onChange={(e) => update.id && handleUpdateStatus(update.id, e.target.value as Update['status'])}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="pending" style={{ backgroundColor: '#111' }}>Pending</option>
                        <option value="in-progress" style={{ backgroundColor: '#111' }}>In Progress</option>
                        <option value="completed" style={{ backgroundColor: '#111' }}>Completed</option>
                        <option value="deployed" style={{ backgroundColor: '#111' }}>Deployed</option>
                      </select>

                      {/* Delete Button */}
                      {update.userId === user?.uid && (
                        <button
                          onClick={() => update.id && handleDeleteUpdate(update.id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#EF4444',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Hapus Update"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                          </svg>
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages Column */}
        <div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            height: 'calc(100vh - 220px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Messages Header */}
            <div style={{
              padding: '25px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '5px'
              }}>
                Diskusi Update
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                {messages.length} pesan
              </div>
            </div>

            {/* Messages Container */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '18px'
                }}>
                  Belum ada pesan
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {messages.map((message) => (
                    <div key={message.id} style={{
                      display: 'flex',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'rgba(0,220,130,0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#00DC82',
                        flexShrink: 0
                      }}>
                        {message.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '5px'
                        }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'white'
                          }}>
                            {message.userName}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.4)'
                          }}>
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: 'rgba(255,255,255,0.8)',
                          lineHeight: '1.5'
                        }}>
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan... (Gunakan @nama untuk mention)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: newMessage.trim() ? '#00C2FF' : 'rgba(0,194,255,0.3)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal buat update baru */}
      {showNewUpdateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '30px',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '800px',
            padding: '60px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              marginBottom: '50px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <div style={{
                fontSize: '36px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                marginBottom: '20px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                Buat Update Baru
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <input
                type="text"
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                placeholder="Judul Update"
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '24px',
                  outline: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  lineHeight: '1.3',
                  borderRadius: '12px'
                }}
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <select
                  value={newUpdate.category}
                  onChange={(e) => setNewUpdate({...newUpdate, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '18px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 15px center',
                    backgroundSize: '20px',
                    borderRadius: '12px'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'black', color: 'white', fontSize: '16px' }}>
                    Pilih Kategori
                  </option>
                  {categories.map((category) => (
                    <option 
                      key={category} 
                      value={category}
                      style={{ backgroundColor: 'black', color: 'white', fontSize: '16px' }}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={newUpdate.version}
                  onChange={(e) => setNewUpdate({...newUpdate, version: e.target.value})}
                  placeholder="Version (contoh: v1.2.0)"
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '18px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    borderRadius: '12px'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '15px'
              }}>
                <select
                  value={newUpdate.priority}
                  onChange={(e) => setNewUpdate({...newUpdate, priority: e.target.value as any})}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: priorityColors[newUpdate.priority] + '10',
                    border: `1px solid ${priorityColors[newUpdate.priority]}30`,
                    color: priorityColors[newUpdate.priority],
                    fontSize: '16px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${priorityColors[newUpdate.priority]}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 15px center',
                    backgroundSize: '20px',
                    borderRadius: '12px'
                  }}
                >
                  {['low', 'medium', 'high', 'critical'].map((priority) => (
                    <option 
                      key={priority} 
                      value={priority}
                      style={{ backgroundColor: 'black', color: priorityColors[priority], fontSize: '16px' }}
                    >
                      Priority: {priority}
                    </option>
                  ))}
                </select>

                <select
                  value={newUpdate.impact}
                  onChange={(e) => setNewUpdate({...newUpdate, impact: e.target.value as any})}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: impactColors[newUpdate.impact] + '10',
                    border: `1px solid ${impactColors[newUpdate.impact]}30`,
                    color: impactColors[newUpdate.impact],
                    fontSize: '16px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${impactColors[newUpdate.impact]}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 15px center',
                    backgroundSize: '20px',
                    borderRadius: '12px'
                  }}
                >
                  {['minor', 'moderate', 'major', 'critical'].map((impact) => (
                    <option 
                      key={impact} 
                      value={impact}
                      style={{ backgroundColor: 'black', color: impactColors[impact], fontSize: '16px' }}
                    >
                      Impact: {impact}
                    </option>
                  ))}
                </select>

                <select
                  value={newUpdate.status}
                  onChange={(e) => setNewUpdate({...newUpdate, status: e.target.value as any})}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: statusColors[newUpdate.status] + '10',
                    border: `1px solid ${statusColors[newUpdate.status]}30`,
                    color: statusColors[newUpdate.status],
                    fontSize: '16px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${statusColors[newUpdate.status]}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 15px center',
                    backgroundSize: '20px',
                    borderRadius: '12px'
                  }}
                >
                  {['pending', 'in-progress', 'completed', 'deployed'].map((status) => (
                    <option 
                      key={status} 
                      value={status}
                      style={{ backgroundColor: 'black', color: statusColors[status], fontSize: '16px' }}
                    >
                      Status: {status}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={newUpdate.description}
                onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})}
                placeholder="Deskripsi Update"
                rows={8}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '20px',
                  outline: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  resize: 'none',
                  lineHeight: '1.6',
                  borderRadius: '12px'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '20px',
                marginTop: '40px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                <button
                  onClick={() => setShowNewUpdateForm(false)}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '18px',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    borderRadius: '12px'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateUpdate}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: '#00C2FF',
                    border: 'none',
                    color: 'white',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Buat Update
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
