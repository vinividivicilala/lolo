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
  link: string;
  version: string;
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: any;
  updatedAt: any;
  savedBy?: string[];
  thumbnail?: string;
}

interface Message {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  userEmail?: string;
  updateId?: string;
  createdAt: any;
}

interface Notification {
  id?: string;
  type: 'update' | 'comment' | 'share';
  updateId?: string;
  messageId?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName?: string;
  message: string;
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
    link: "",
    version: ""
  });
  const [newMessage, setNewMessage] = useState("");
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

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
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      
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

  const generateThumbnail = (link: string): string => {
    if (!link) return "";
    
    try {
      const url = new URL(link);
      
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) {
          return `https://i.vimeocdn.com/video/${videoId}_640.jpg`;
        }
      }
      
      return "";
    } catch {
      return "";
    }
  };

  const handleCreateUpdate = async () => {
    if (!user || !db || !newUpdate.title.trim()) {
      alert("Judul update harus diisi");
      return;
    }

    try {
      const thumbnail = generateThumbnail(newUpdate.link.trim());

      const updateData = {
        title: newUpdate.title.trim(),
        category: newUpdate.category.trim(),
        description: newUpdate.description.trim(),
        link: newUpdate.link.trim(),
        version: newUpdate.version.trim(),
        thumbnail: thumbnail,
        userId: user.uid,
        userName: userDisplayName,
        userEmail: userEmail,
        savedBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'updates'), updateData);
      
      // Create notification for all users
      await addDoc(collection(db, 'updateNotifications'), {
        type: 'update',
        updateId: docRef.id,
        senderId: user.uid,
        senderName: userDisplayName,
        receiverId: 'all',
        message: `Update baru: "${newUpdate.title.trim()}"`,
        createdAt: serverTimestamp()
      });
      
      setNewUpdate({ 
        title: "", 
        category: "", 
        description: "",
        link: "",
        version: ""
      });
      setShowNewUpdateForm(false);
      
    } catch (error) {
      console.error("Error creating update:", error);
      alert("Gagal membuat update. Silakan coba lagi.");
    }
  };

  const handleSaveUpdate = async (updateId: string) => {
    if (!user || !db) return;

    try {
      const updateRef = doc(db, 'updates', updateId);
      const update = updates.find(u => u.id === updateId);
      
      if (update?.savedBy?.includes(user.uid)) {
        // Unsave
        await updateDoc(updateRef, {
          savedBy: arrayRemove(user.uid)
        });
      } else {
        // Save
        await updateDoc(updateRef, {
          savedBy: arrayUnion(user.uid)
        });
      }
      
    } catch (error) {
      console.error("Error saving update:", error);
    }
  };

  const handleShareUpdate = async (updateId: string) => {
    if (!user || !db) return;

    try {
      const update = updates.find(u => u.id === updateId);
      if (!update) return;

      // Create share notification
      await addDoc(collection(db, 'updateNotifications'), {
        type: 'share',
        updateId: updateId,
        senderId: user.uid,
        senderName: userDisplayName,
        receiverId: 'all',
        message: `${userDisplayName} membagikan update: "${update.title}"`,
        createdAt: serverTimestamp()
      });

      // Also post as message
      await addDoc(collection(db, 'updateMessages'), {
        text: `Saya membagikan update: "${update.title}"`,
        userId: user.uid,
        userName: userDisplayName,
        userEmail: userEmail,
        updateId: updateId,
        createdAt: serverTimestamp()
      });

      alert("Update berhasil dibagikan!");
      
    } catch (error) {
      console.error("Error sharing update:", error);
      alert("Gagal membagikan update.");
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
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'updateMessages'), messageData);
      
      // Notify mentions
      const mentionRegex = /@(\w+)/g;
      let match;
      while ((match = mentionRegex.exec(newMessage)) !== null) {
        const mentionedUser = match[1];
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', mentionedUser));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const mentionedUserDoc = querySnapshot.docs[0];
          await addDoc(collection(db, 'updateNotifications'), {
            type: 'comment',
            senderId: user.uid,
            senderName: userDisplayName,
            receiverId: mentionedUserDoc.id,
            receiverName: mentionedUserDoc.data().name,
            message: `${userDisplayName} menyebut Anda dalam pesan`,
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
      await deleteDoc(doc(db, 'updateNotifications', notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
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

  const getVideoEmbedUrl = (link: string) => {
    if (!link) return null;
    
    try {
      const url = new URL(link);
      
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
        }
      }
      
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
        }
      }
      
      if (link.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) {
        return link;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const togglePlayPause = (updateId: string) => {
    const video = videoRefs.current[updateId];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const pendingNotifications = notifications.filter(n => n.status === 'unread');
  const notificationCount = notifications.length;

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
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          cursor: 'pointer'
                        }}
                        onClick={() => notification.id && handleMarkNotificationAsRead(notification.id)}
                      >
                        <div style={{
                          fontSize: '18px',
                          marginBottom: '10px',
                          color: 'white'
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
              gap: '80px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              {updates.map((update) => {
                const videoEmbedUrl = getVideoEmbedUrl(update.link);
                const isSaved = update.savedBy && update.savedBy.includes(user?.uid);
                
                return (
                  <div
                    key={update.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '25px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      paddingBottom: '40px'
                    }}
                  >
                    {update.category && (
                      <div style={{
                        fontSize: '28px',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        color: 'white',
                        marginBottom: '15px',
                        fontWeight: '600'
                      }}>
                        {update.category}
                      </div>
                    )}

                    <div style={{
                      fontSize: '48px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      lineHeight: '1.3',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {update.title}
                    </div>

                    {update.version && (
                      <div style={{
                        fontSize: '24px',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 12h20M12 2v20"/>
                        </svg>
                        Version: {update.version}
                      </div>
                    )}

                    {update.description && (
                      <div style={{
                        fontSize: '28px',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        lineHeight: '1.6',
                        color: 'white',
                        marginTop: '25px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {update.description}
                      </div>
                    )}

                    {update.thumbnail && !videoEmbedUrl && (
                      <div style={{
                        margin: '20px 0'
                      }}>
                        <img 
                          src={update.thumbnail} 
                          alt="Thumbnail"
                          style={{
                            width: '100%',
                            maxWidth: '600px',
                            height: 'auto',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                    )}

                    {videoEmbedUrl && (
                      <div style={{
                        margin: '30px 0',
                        position: 'relative'
                      }}>
                        {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com') ? (
                          <div style={{
                            position: 'relative',
                            paddingBottom: '56.25%',
                            height: 0,
                            overflow: 'hidden',
                            backgroundColor: '#000'
                          }}>
                            <iframe
                              src={videoEmbedUrl}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none'
                              }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div style={{
                            position: 'relative',
                            backgroundColor: '#000'
                          }}>
                            <video
                              ref={(el) => {
                                if (update.id) videoRefs.current[update.id] = el;
                              }}
                              src={videoEmbedUrl}
                              style={{
                                width: '100%',
                                maxWidth: '600px',
                                height: 'auto',
                                aspectRatio: '16/9',
                                backgroundColor: '#000',
                                cursor: 'pointer'
                              }}
                              onClick={() => togglePlayPause(update.id!)}
                              controls
                            />
                            {!update.thumbnail && (
                              <button
                                onClick={() => togglePlayPause(update.id!)}
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '80px',
                                  height: '80px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '30px',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                      }}>
                        <span style={{
                          fontSize: '22px',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          color: 'white'
                        }}>
                          {formatDate(update.createdAt)}
                        </span>
                        <span style={{
                          fontSize: '18px',
                          color: '#aaa'
                        }}>
                          oleh {update.userName}
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        fontFamily: 'Helvetica, Arial, sans-serif'
                      }}>
                        {/* Save Button */}
                        <button
                          onClick={() => handleSaveUpdate(update.id!)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: isSaved ? 'gold' : 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={isSaved ? "Disimpan" : "Simpan Update"}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "gold" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                          </svg>
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShareUpdate(update.id!)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Bagikan Update"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                        </button>

                        {update.link && (
                          <a
                            href={update.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'white',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '20px',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}
                          >
                            Buka Link
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17l9.2-9.2M17 17V7H7"/>
                            </svg>
                          </a>
                        )}
                        
                        {update.userId === user?.uid && (
                          <button
                            onClick={() => handleDeleteUpdate(update.id!)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: 'white',
                              fontSize: '32px',
                              cursor: 'pointer',
                              padding: '0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '40px',
                              height: '40px'
                            }}
                            title="Hapus Update"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages Column */}
        <div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
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
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: 'white',
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
                    borderRadius: '8px',
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
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
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
              gap: '30px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <div>
                <input
                  type="text"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                  placeholder="Judul Update"
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '32px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: '1.3'
                  }}
                />
              </div>

              <div>
                <select
                  value={newUpdate.category}
                  onChange={(e) => setNewUpdate({...newUpdate, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 20px center',
                    backgroundSize: '24px'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'black', color: 'white', fontSize: '20px' }}>
                    Pilih Kategori
                  </option>
                  {categories.map((category) => (
                    <option 
                      key={category} 
                      value={category}
                      style={{ backgroundColor: 'black', color: 'white', fontSize: '20px' }}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={newUpdate.version}
                  onChange={(e) => setNewUpdate({...newUpdate, version: e.target.value})}
                  placeholder="Version (contoh: v1.2.0)"
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              <div>
                <input
                  type="text"
                  value={newUpdate.link}
                  onChange={(e) => setNewUpdate({...newUpdate, link: e.target.value})}
                  placeholder="Link Video (YouTube, Vimeo, dll.)"
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              <div>
                <textarea
                  value={newUpdate.description}
                  onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})}
                  placeholder="Deskripsi Update"
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    resize: 'none',
                    lineHeight: '1.6'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '25px',
                marginTop: '50px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                <button
                  onClick={() => setShowNewUpdateForm(false)}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '22px',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateUpdate}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '22px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontFamily: 'Helvetica, Arial, sans-serif'
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
