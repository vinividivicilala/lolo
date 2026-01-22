
'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  writeBatch
} from "firebase/firestore";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

  auth = getAuth(app);
  db = getFirestore(app);
}

// Providers untuk login
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

// Type untuk komentar
interface Comment {
  id?: string;
  photoIndex: number;
  text: string;
  user: string;
  userId?: string;
  timestamp: Timestamp | Date;
  userAvatar?: string;
}

// Type untuk user stats
interface UserStats {
  totalLogins: number;
  lastLogin: Timestamp | Date;
  loginCount: number;
  userName: string;
}


// Type untuk notifikasi - SESUAIKAN DENGAN NOTIFICATIONS PAGE
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'announcement' | 'alert' | 'update' | 'comment' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  senderId: string;
  senderName: string;
  senderEmail?: string;
  senderPhotoURL?: string;
  recipientType: 'all' | 'specific' | 'email_only' | 'app_only';
  recipientIds?: string[];
  recipientEmails?: string[];
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Timestamp | Date;
  actionUrl?: string;
  icon: string;
  color: string;
  userReads: Record<string, boolean>;
  views?: number;
  clicks?: number;
  likes?: string[];
  comments?: any[];
  allowComments?: boolean;
  isAdminPost?: boolean; // Tambahkan
  adminName?: string; // Tambahkan
  category?: string; // Tambahkan
}








export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [loadingText, setLoadingText] = useState("NURU");
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"main" | "index" | "grid">("main");
  const [sliderPosition, setSliderPosition] = useState<"index" | "grid">("grid");
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isProgressActive, setIsProgressActive] = useState(true);
  const [showCookieNotification, setShowCookieNotification] = useState(false);
  const [showMenuruFullPage, setShowMenuruFullPage] = useState(false);
  const [showPhotoFullPage, setShowPhotoFullPage] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [isNameScrolling, setIsNameScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"left" | "right">("right");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHoveringSignIn, setIsHoveringSignIn] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalLoggedInUsers, setTotalLoggedInUsers] = useState(0);
  
  // State untuk popup chatbot
  const [showChatbotPopup, setShowChatbotPopup] = useState(true);
  
  // State untuk counter foto
  const [leftCounter, setLeftCounter] = useState("01");
  const totalPhotos = "03";
  
  // State untuk posisi gambar
  const [imagePosition, setImagePosition] = useState(0);
  
  // State untuk komentar
  const [message, setMessage] = useState("");
  const [photoTimeAgo, setPhotoTimeAgo] = useState<string[]>([]);
  
  // State untuk komentar dari Firebase
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // State untuk menu overlay
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);

  // State untuk notifikasi dan search - DIPERBARUI
  const [showNotification, setShowNotification] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const topicContainerRef = useRef<HTMLDivElement>(null);
  const progressAnimationRef = useRef<gsap.core.Tween | null>(null);
  const menuruButtonRef = useRef<HTMLDivElement>(null);
  const plusSignRef = useRef<HTMLDivElement>(null);
  const backslashRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const userTextRef = useRef<HTMLSpanElement>(null);
  const leftCounterRef = useRef<HTMLSpanElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const chatbotPopupRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk notifikasi dan search
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Animasi loading text
  const loadingTexts = [
    "NURU", "MBACA", "NULIS", "NGEXPLORASI", 
    "NEMUKAN", "NCIPTA", "NGGALI", "NARIK",
    "NGAMATI", "NANCANG", "NGEMBANGKAN", "NYUSUN"
  ];

  // Data foto untuk progress bar
  const progressPhotos = [
    { 
      id: 1, 
      src: "images/5.jpg", 
      alt: "Photo 1",
      uploadTime: new Date(Date.now() - 5 * 60 * 1000)
    },
    { 
      id: 2, 
      src: "images/6.jpg", 
      alt: "Photo 2",
      uploadTime: new Date(Date.now() - 2 * 60 * 1000)
    },
    { 
      id: 3, 
      src: "images/5.jpg", 
      alt: "Photo 3",
      uploadTime: new Date(Date.now() - 30 * 1000)
    }
  ];

  // Data untuk Roles
  const rolesData = [
    { title: "My Roles", description: "Branding & Creative Direction" },
    { title: "Design", description: "Visual identity & UI/UX" },
    { title: "Development", description: "Frontend & Backend" },
    { title: "Features", description: "Functionality & Integration" }
  ];


// Helper functions yang HARUS ADA:
const getIconByType = (type: string): string => {
  switch (type) {
    case 'system': return '🔄';
    case 'announcement': return '📢';
    case 'alert': return '⚠️';
    case 'update': return '🆕';
    case 'comment': return '💬';
    case 'personal': return '👤';
    default: return '📌';
  }
};

const getColorByType = (type: string): string => {
  switch (type) {
    case 'system': return '#6366F1';
    case 'announcement': return '#0050B7';
    case 'alert': return '#FF4757';
    case 'update': return '#00FF00';
    case 'comment': return '#8B5CF6';
    case 'personal': return '#F59E0B';
    default: return '#6B7280';
  }
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return '#FF4757';
    case 'high': return '#FF6B6B';
    case 'medium': return '#FFA502';
    case 'low': return '#2ED573';
    default: return '#747D8C';
  }
};

const getBgColorByType = (type: string): string => {
  const color = getColorByType(type);
  return color + '20'; // 20 = 12% opacity dalam hex
};


// Fungsi untuk mengirim notifikasi - DIPERBAIKI
const sendNotification = async (notificationData: {
  title: string;
  message: string;
  type: 'announcement' | 'update' | 'alert' | 'system';
  userId?: string;
  userDisplayName?: string;
  userEmail?: string;
  isAdminPost?: boolean;
  adminName?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: 'general' | 'feature' | 'maintenance' | 'security';
}) => {
  try {
    if (!db) {
      console.error("❌ Firebase tidak tersedia untuk mengirim notifikasi");
      return false;
    }
    
    const newNotification = {
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      read: false,
      timestamp: serverTimestamp(),
      icon: getIconByType(notificationData.type),
      userId: notificationData.userId || '',
      userDisplayName: notificationData.userDisplayName || '',
      userEmail: notificationData.userEmail || '',
      userAvatar: notificationData.userDisplayName?.charAt(0).toUpperCase() || '👤',
      isAdminPost: notificationData.isAdminPost || false,
      adminName: notificationData.adminName || 'Admin',
      priority: notificationData.priority || 'medium',
      category: notificationData.category || 'general',
      createdAt: serverTimestamp()
    };

    console.log("📤 Mengirim notifikasi:", newNotification);
    
    const docRef = await addDoc(collection(db, 'notifications'), newNotification);
    console.log("✅ Notification sent successfully with ID:", docRef.id);
    
    // Auto-refresh notifications after sending
    setTimeout(() => {
      // Trigger re-fetch atau update state
      console.log("🔄 Trigger refresh notifikasi");
    }, 1000);
    
    return true;
  } catch (error: any) {
    console.error("❌ Error sending notification:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    return false;
  }
};


// Fungsi untuk mark notification as read - PERBAIKI
const markAsRead = async (notificationId: string) => {
  try {
    if (!db || !auth) return;
    
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : 
                         localStorage.getItem('anonymous_user_id');
    
    if (!currentUserId) {
      console.error("❌ No user ID found for marking as read");
      return;
    }
    
    const userIdToUse = currentUser ? currentUser.uid : currentUserId;
    const notificationRef = doc(db, 'notifications', notificationId);
    
    // Update di Firestore
    await updateDoc(notificationRef, {
      [`userReads.${userIdToUse}`]: true,
      views: increment(1)
    });
    
    console.log(`✅ Marked notification ${notificationId} as read for user ${userIdToUse}`);
    
    // Update local state
    setNotifications(prev => prev.map(notif => {
      if (notif.id === notificationId) {
        return {
          ...notif,
          userReads: {
            ...notif.userReads,
            [userIdToUse]: true
          },
          views: (notif.views || 0) + 1
        };
      }
      return notif;
    }));
    
    // Update unread count
    setNotificationCount(prev => Math.max(0, prev - 1));
    setHasUnreadNotifications(prev => {
      const newCount = notificationCount - 1;
      return newCount > 0;
    });
    
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
  }
};


  

  

  // Handler untuk klik notifikasi - DIPERBARUI
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read ketika diklik
   if (notification.id && !notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Untuk notifikasi admin, tidak ada navigasi khusus
    // Hanya menampilkan detail notifikasi
    console.log("Notification clicked:", notification);
    
    setShowNotification(false);
  };



// Fungsi untuk clear all notifications - PERBAIKI
const handleClearNotification = async () => {
  try {
    if (!db || !auth) return;
    
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : 
                         localStorage.getItem('anonymous_user_id');
    
    if (!currentUserId) {
      console.error("❌ No user ID found for clearing notifications");
      return;
    }
    
    const userIdToUse = currentUser ? currentUser.uid : currentUserId;
    
    // Update semua notifikasi yang belum dibaca
    const batch = writeBatch(db);
    const unreadNotifications = notifications.filter(notification => {
      return !notification.userReads?.[userIdToUse];
    });
    
    console.log(`🗑️ Clearing ${unreadNotifications.length} unread notifications`);
    
    unreadNotifications.forEach(notification => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, {
        [`userReads.${userIdToUse}`]: true,
        views: firestoreIncrement(1)
      });
    });
    
    await batch.commit();
    
    // Update semua notifikasi di local state
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      userReads: {
        ...notification.userReads,
        [userIdToUse]: true
      },
      views: (notification.views || 0) + 1
    })));
    
    setHasUnreadNotifications(false);
    setNotificationCount(0);
    setShowNotification(false);
    
    console.log("✅ All notifications marked as read");
    
  } catch (error) {
    console.error("❌ Error clearing notifications:", error);
  }
};





const calculateTimeAgo = (date: Date | Timestamp | undefined | null): string => {
  try {
    // Handle undefined atau null
    if (!date) {
      return "Recently";
    }
    
    const now = new Date();
    let commentDate: Date;
    
    if (date instanceof Timestamp) {
      commentDate = date.toDate();
    } else if (date instanceof Date) {
      commentDate = date;
    } else {
      // Coba parse jika string atau object lain
      commentDate = new Date(date);
    }
    
    // Validasi date
    if (!commentDate || isNaN(commentDate.getTime())) {
      return "Recently";
    }
    
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) { // 30 hari
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}mo ago`;
    }
  } catch (error) {
    console.error("Error calculating time ago:", error);
    return "Recently";
  }
};
  

  

  // Update waktu yang lalu secara real-time
  useEffect(() => {
    const updateTimes = () => {
      const newTimes = progressPhotos.map(photo => 
        calculateTimeAgo(photo.uploadTime)
      );
      setPhotoTimeAgo(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk update user stats di Firestore
  const updateUserStats = async (userId: string, userName: string) => {
    try {
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (userStatsDoc.exists()) {
        // Update existing user stats
        await updateDoc(userStatsRef, {
          loginCount: increment(1),
          lastLogin: serverTimestamp(),
          userName: userName,
          updatedAt: serverTimestamp()
        });
        
        // Update total logins count
        const totalLoginsRef = doc(db, 'appStats', 'totalLogins');
        const totalLoginsDoc = await getDoc(totalLoginsRef);
        
        if (totalLoginsDoc.exists()) {
          await updateDoc(totalLoginsRef, {
            count: increment(1),
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(totalLoginsRef, {
            count: 1,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // Create new user stats
        await setDoc(userStatsRef, {
          userId: userId,
          userName: userName,
          loginCount: 1,
          totalLogins: 1,
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Update total users count
        const totalUsersRef = doc(db, 'appStats', 'totalUsers');
        const totalUsersDoc = await getDoc(totalUsersRef);
        
        if (totalUsersDoc.exists()) {
          await updateDoc(totalUsersRef, {
            count: increment(1),
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(totalUsersRef, {
            count: 1,
            updatedAt: serverTimestamp()
          });
        }
        
        // Initialize total logins
        const totalLoginsRef = doc(db, 'appStats', 'totalLogins');
        const totalLoginsDoc = await getDoc(totalLoginsRef);
        if (!totalLoginsDoc.exists()) {
          await setDoc(totalLoginsRef, {
            count: 1,
            updatedAt: serverTimestamp()
          });
        }
      }

    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };

  // Load total users count
  useEffect(() => {
    const loadTotalUsers = async () => {
      try {
        const totalUsersRef = doc(db, 'appStats', 'totalUsers');
        const totalUsersDoc = await getDoc(totalUsersRef);
        
        if (totalUsersDoc.exists()) {
          setTotalUsers(totalUsersDoc.data().count || 0);
        }
      } catch (error) {
        console.error("Error loading total users:", error);
      }
    };

    loadTotalUsers();
  }, []);

  // Load total logged in users
  useEffect(() => {
    const loadTotalLoggedInUsers = async () => {
      try {
        const totalLoginsRef = doc(db, 'appStats', 'totalLogins');
        const totalLoginsDoc = await getDoc(totalLoginsRef);
        
        if (totalLoginsDoc.exists()) {
          setTotalLoggedInUsers(totalLoginsDoc.data().count || 0);
        }
      } catch (error) {
        console.error("Error loading total logged in users:", error);
      }
    };

    loadTotalLoggedInUsers();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Get display name
        const name = currentUser.displayName || 
                     currentUser.email?.split('@')[0] || 
                     'User';
        setUserDisplayName(name);
        
        // Update user stats
        await updateUserStats(currentUser.uid, name);
        
        // TIDAK LAGI MENGIRIM NOTIFIKASI LOGIN
        
        // Load user stats
        try {
          const userStatsRef = doc(db, 'userStats', currentUser.uid);
          const userStatsDoc = await getDoc(userStatsRef);
          
          if (userStatsDoc.exists()) {
            setUserStats(userStatsDoc.data() as UserStats);
          }
        } catch (error) {
          console.error("Error loading user stats:", error);
        }
      } else {
        setUser(null);
        setUserDisplayName("");
        setUserStats(null);
        setShowUserDropdown(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load comments from Firebase
  useEffect(() => {
    console.log("Memulai loading komentar...");
    setIsLoadingComments(true);
    
    const commentsRef = collection(db, 'photoComments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("Snapshot diterima, jumlah dokumen:", querySnapshot.size);
      const commentsData: Comment[] = [];
      querySnapshot.forEach((doc) => {
        console.log("Komentar:", doc.id, doc.data());
        commentsData.push({
          id: doc.id,
          ...doc.data()
        } as Comment);
      });
      setComments(commentsData);
      setIsLoadingComments(false);
    }, (error) => {
      console.error("Error loading comments:", error);
      console.error("Error code:", error.code);
      setIsLoadingComments(false);
    });

    return () => unsubscribe();
  }, []);



  
// Load notifications from Firebase - PERBAIKI SESUAI DENGAN NOTIFICATIONS PAGE
useEffect(() => {
  console.log("🚀 Memulai loading notifikasi untuk halaman utama...");
  
  if (!db) {
    console.log("❌ Firebase belum siap");
    setIsLoadingNotifications(false);
    return;
  }
  
  setIsLoadingNotifications(true);
  
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    
    console.log("📡 Mendengarkan notifikasi dari Firestore...");
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        console.log("✅ Notifikasi diterima:", querySnapshot.size, "dokumen");
        
        if (querySnapshot.empty) {
          console.log("ℹ️ Tidak ada notifikasi di database");
          setNotifications([]);
          setHasUnreadNotifications(false);
          setNotificationCount(0);
          setIsLoadingNotifications(false);
          return;
        }
        
        const notificationsData: Notification[] = [];
        let unreadCount = 0;
        
        // Get current user info
        const currentUser = auth?.currentUser;
        const currentUserId = currentUser ? currentUser.uid : 
                              localStorage.getItem('anonymous_user_id') || 
                              'anonymous_' + Date.now();
        
        // Generate anonymous ID jika belum ada
        if (!currentUser && !localStorage.getItem('anonymous_user_id')) {
          localStorage.setItem('anonymous_user_id', currentUserId);
        }
        
        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            console.log(`📝 Memproses notifikasi ${doc.id}:`, {
              title: data.title,
              type: data.type,
              isDeleted: data.isDeleted
            });
            
            // Skip jika deleted
            if (data.isDeleted === true) {
              console.log(`⏭️ Skip notifikasi ${doc.id} karena deleted`);
              return;
            }
            
            // Cek apakah user bisa melihat notifikasi ini
            let shouldShow = false;
            
            switch (data.recipientType) {
              case 'all':
                // Semua orang bisa lihat
                shouldShow = true;
                break;
                
              case 'specific':
                // Hanya untuk user tertentu
                const recipientIds = data.recipientIds || [];
                if (recipientIds.includes(currentUserId) || 
                    (currentUser && recipientIds.includes(currentUser.uid))) {
                  shouldShow = true;
                }
                break;
                
              case 'email_only':
                // Hanya untuk email tertentu
                if (currentUser && data.recipientEmails?.includes(currentUser.email)) {
                  shouldShow = true;
                }
                break;
                
              case 'app_only':
                // Hanya untuk logged in users
                if (currentUser) {
                  shouldShow = true;
                }
                break;
                
              default:
                shouldShow = false;
            }
            
            if (shouldShow) {
              // Convert timestamp
              let timestamp = data.createdAt;
              if (timestamp && typeof timestamp.toDate === 'function') {
                timestamp = timestamp.toDate();
              }
              
              const notification: Notification = {
                id: doc.id,
                title: data.title || "No Title",
                message: data.message || "",
                type: data.type || 'announcement',
                priority: data.priority || 'medium',
                senderId: data.senderId || 'system',
                senderName: data.senderName || 'System',
                senderEmail: data.senderEmail,
                senderPhotoURL: data.senderPhotoURL,
                recipientType: data.recipientType || 'all',
                recipientIds: data.recipientIds || [],
                recipientEmails: data.recipientEmails || [],
                isRead: false, // Will be calculated based on userReads
                isDeleted: data.isDeleted || false,
                createdAt: timestamp || new Date(),
                actionUrl: data.actionUrl,
                icon: data.icon || getIconByType(data.type || 'announcement'),
                color: data.color || '#0050B7',
                userReads: data.userReads || {},
                views: data.views || 0,
                clicks: data.clicks || 0,
                likes: data.likes || [],
                comments: data.comments || [],
                allowComments: data.allowComments || false,
                 read: data.read || false, // Tambahkan properti read untuk kompatibilitas
      isAdminPost: data.isAdminPost || false, // Tambahkan
      adminName: data.adminName || '', // Tambahkan
      category: data.category || 'general' // Tambahkan
              };
              
              // Cek apakah user sudah baca notifikasi ini
              const isReadByUser = notification.userReads[currentUserId] || 
                                  (currentUser && notification.userReads[currentUser.uid]) || 
                                  false;
              
              if (!isReadByUser) {
                unreadCount++;
              }
              
              notificationsData.push(notification);
              console.log(`✅ Ditambahkan: ${notification.title} (${isReadByUser ? 'read' : 'unread'})`);
            }
          } catch (error) {
            console.error(`❌ Error processing notification ${doc.id}:`, error);
          }
        });
        
        console.log(`📊 Total notifikasi untuk user: ${notificationsData.length}, Unread: ${unreadCount}`);
        
        setNotifications(notificationsData);
        setHasUnreadNotifications(unreadCount > 0);
        setNotificationCount(unreadCount);
        setIsLoadingNotifications(false);
      }, 
      (error) => {
        console.error("❌ Error loading notifications:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // Untuk debugging, tambahkan dummy data jika error
        if (process.env.NODE_ENV === 'development') {
          const dummyNotifications: Notification[] = [
            {
              id: 'dummy1',
              title: "Welcome to MENURU!",
              message: "Welcome to our platform. Notifications are working correctly.",
              type: 'announcement',
              priority: 'medium',
              senderId: 'system',
              senderName: 'System',
              isRead: false,
              isDeleted: false,
              createdAt: new Date(),
              icon: '📢',
              color: '#0050B7',
              userReads: {},
              recipientType: 'all',
              views: 0,
              clicks: 0,
              likes: []
            },
            {
              id: 'dummy2',
              title: "Firebase Connected",
              message: "Successfully connected to Firebase database.",
              type: 'system',
              priority: 'low',
              senderId: 'system',
              senderName: 'System',
              isRead: false,
              isDeleted: false,
              createdAt: new Date(Date.now() - 3600000),
              icon: '🔄',
              color: '#6366F1',
              userReads: {},
              recipientType: 'all',
              views: 0,
              clicks: 0,
              likes: []
            }
          ];
          
          setNotifications(dummyNotifications);
          setHasUnreadNotifications(true);
          setNotificationCount(2);
        }
        
        setIsLoadingNotifications(false);
      }
    );
    
    return () => unsubscribe();
  } catch (error) {
    console.error("❌ Error in notifications useEffect:", error);
    setIsLoadingNotifications(false);
  }
}, [db, auth?.currentUser]); // Tambahkan auth sebagai dependency



  

 

  // Animasi teks nama user berjalan
  useEffect(() => {
    if (user && userTextRef.current && userButtonRef.current) {
      const textWidth = userTextRef.current.scrollWidth;
      const buttonWidth = userButtonRef.current.clientWidth;
      
      if (textWidth > buttonWidth) {
        setIsNameScrolling(true);
        
        const animation = gsap.to(userTextRef.current, {
          x: -(textWidth - buttonWidth + 20),
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          onReverseComplete: () => {
            setScrollDirection("right");
          },
          onComplete: () => {
            setScrollDirection("left");
          }
        });

        return () => {
          animation.kill();
        };
      } else {
        setIsNameScrolling(false);
      }
    }
  }, [user, userDisplayName, isMobile]);

  // Animasi GSAP untuk search expand
  useEffect(() => {
    if (searchContainerRef.current) {
      if (showSearch) {
        gsap.to(searchContainerRef.current, {
          width: 250,
          duration: 0.3,
          ease: "power2.out"
        });
        // Auto focus input
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
      } else {
        gsap.to(searchContainerRef.current, {
          width: 40,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setSearchQuery("");
          }
        });
      }
    }
  }, [showSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (chatbotPopupRef.current && !chatbotPopupRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        const isChatbotNavButton = target.closest('[data-nav-chatbot]');
        if (!isChatbotNavButton) {
          setShowChatbotPopup(false);
        }
      }
      if (menuOverlayRef.current && !menuOverlayRef.current.contains(event.target as Node)) {
        handleCloseMenu();
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotification(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fungsi untuk mengupdate counter angka kiri dengan animasi GSAP
  const updateLeftCounter = (newIndex: number) => {
    const newLeftCounter = String(newIndex + 1).padStart(2, '0');
    
    if (leftCounterRef.current) {
      // Animasi fade out current counter
      gsap.to(leftCounterRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        onComplete: () => {
          // Update text
          setLeftCounter(newLeftCounter);
          
          // Animasi fade in new counter
          gsap.fromTo(leftCounterRef.current, 
            { opacity: 0, y: 10 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.3,
              ease: "power2.out"
            }
          );
        }
      });
    } else {
      setLeftCounter(newLeftCounter);
    }
  };

  // Update counter ketika currentPhotoIndex berubah
  useEffect(() => {
    updateLeftCounter(currentPhotoIndex);
  }, [currentPhotoIndex]);

  // Update posisi gambar ketika hoveredTopic berubah
  useEffect(() => {
    if (hoveredTopic !== null) {
      const topicIndex = indexTopics.findIndex(topic => topic.id === hoveredTopic);
      const newPosition = topicIndex * 40;
      setImagePosition(newPosition);
    } else {
      setImagePosition(0);
    }
  }, [hoveredTopic]);

  // Handler untuk membuka menu overlay dengan animasi GSAP
  const handleOpenMenu = () => {
    setShowMenuOverlay(true);
  };

  // Handler untuk menutup menu overlay dengan animasi GSAP
  const handleCloseMenu = () => {
    if (menuOverlayRef.current) {
      const tl = gsap.timeline();
      
      tl.to(menuOverlayRef.current, {
        y: '-100%',
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          setShowMenuOverlay(false);
        }
      });
    } else {
      setShowMenuOverlay(false);
    }
  };

  // Animasi GSAP saat menu dibuka
  useEffect(() => {
    if (showMenuOverlay && menuOverlayRef.current) {
      gsap.set(menuOverlayRef.current, { y: '-100%' });
      
      const tl = gsap.timeline();
      tl.to(menuOverlayRef.current, {
        y: '0%',
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [showMenuOverlay]);

  useEffect(() => {
    const cookieAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookieAccepted) {
      setTimeout(() => {
        setShowCookieNotification(true);
      }, 2000);
    }

    const chatbotShown = localStorage.getItem('chatbotPopupShown');
    if (!chatbotShown) {
      setTimeout(() => {
        setShowChatbotPopup(true);
      }, 3000);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentIndex]);
    }, 500);

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(textInterval);
    }, 3000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPhotoFullPage) {
        if (e.key === 'ArrowLeft') {
          prevPhoto();
        } else if (e.key === 'ArrowRight') {
          nextPhoto();
        }
      }
      
      if (e.key === 'Escape') {
        if (showMenuruFullPage) {
          handleCloseMenuruFullPage();
        }
        if (showPhotoFullPage) {
          handleClosePhotoFullPage();
        }
        if (showUserDropdown) {
          setShowUserDropdown(false);
        }
        if (showLogoutModal) {
          setShowLogoutModal(false);
        }
        if (showChatbotPopup) {
          setShowChatbotPopup(false);
        }
        if (showMenuOverlay) {
          handleCloseMenu();
        }
        if (showNotification) {
          setShowNotification(false);
        }
        if (showSearch) {
          setShowSearch(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(textInterval);
      clearTimeout(loadingTimeout);
      document.removeEventListener('keydown', handleKeyDown);
      if (progressAnimationRef.current) {
        progressAnimationRef.current.kill();
      }
      if (plusSignRef.current) {
        gsap.killTweensOf(plusSignRef.current);
      }
      if (backslashRef.current) {
        gsap.killTweensOf(backslashRef.current);
      }
      if (leftCounterRef.current) {
        gsap.killTweensOf(leftCounterRef.current);
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile, showMenuruFullPage, showPhotoFullPage, showUserDropdown, showLogoutModal, showChatbotPopup, showMenuOverlay, showNotification, showSearch]);

  // Animasi GSAP untuk tanda + di tombol Menuru
  useEffect(() => {
    if (plusSignRef.current && !showMenuruFullPage) {
      gsap.killTweensOf(plusSignRef.current);
      
      gsap.to(plusSignRef.current, {
        scale: 1.1,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, [showMenuruFullPage]);

  // Animasi GSAP untuk tanda \ di halaman full page
  useEffect(() => {
    if (backslashRef.current && showMenuruFullPage) {
      gsap.killTweensOf(backslashRef.current);
      
      gsap.to(backslashRef.current, {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "linear"
      });
    }
  }, [showMenuruFullPage]);

  // Fungsi untuk handle cookie acceptance
  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieNotification(false);
    
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = `cookiesAccepted=true; expires=${date.toUTCString()}; path=/`;
    
    if (localStorage.getItem('themePreference')) {
      const themePref = localStorage.getItem('themePreference');
      document.cookie = `themePreference=${themePref}; expires=${date.toUTCString()}; path=/`;
    }
  };

  // Fungsi untuk maju ke foto berikutnya
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => {
      const nextIndex = (prev + 1) % progressPhotos.length;
      return nextIndex;
    });
  };

  // Fungsi untuk mundur ke foto sebelumnya
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => {
      const prevIndex = (prev - 1 + progressPhotos.length) % progressPhotos.length;
      return prevIndex;
    });
  };

  // Start progress animation
  const startProgressAnimation = () => {
    if (progressAnimationRef.current) {
      progressAnimationRef.current.kill();
    }

    const progressFills = document.querySelectorAll('.progress-fill');
    progressFills.forEach(fill => {
      (fill as HTMLElement).style.width = '0%';
    });

    const currentFill = document.querySelector(`.progress-fill[data-index="${currentPhotoIndex}"]`) as HTMLElement;
    
    if (currentFill) {
      progressAnimationRef.current = gsap.to(currentFill, {
        width: '100%',
        duration: 15,
        ease: "linear",
        onComplete: () => {
          if (isProgressActive) {
            nextPhoto();
          }
        }
      });
    }
  };

  // Mulai animasi progress ketika currentPhotoIndex berubah
  useEffect(() => {
    if (isProgressActive) {
      startProgressAnimation();
    }
  }, [currentPhotoIndex, isProgressActive]);

  // Handler untuk topic hover
  const handleTopicHover = (topicId: number | null) => {
    setHoveredTopic(topicId);
  };

  // Fungsi untuk toggle slider
  const toggleSlider = () => {
    if (sliderPosition === "index") {
      setSliderPosition("grid");
      setCurrentView("main");
    } else {
      setSliderPosition("index");
      setCurrentView("index");
    }
  };

  // Fungsi untuk toggle halaman full page MENURU
  const toggleMenuruFullPage = () => {
    setShowMenuruFullPage(!showMenuruFullPage);
  };

  // Handler untuk klik tombol MENURU
  const handleMenuruClick = () => {
    toggleMenuruFullPage();
  };

  // Fungsi untuk menutup halaman full page MENURU
  const handleCloseMenuruFullPage = () => {
    setShowMenuruFullPage(false);
  };

  // Handler untuk membuka tampilan foto full page
  const handleOpenPhotoFullPage = () => {
    setShowPhotoFullPage(true);
  };

  // Handler untuk menutup tampilan foto full page
  const handleClosePhotoFullPage = () => {
    setShowPhotoFullPage(false);
  };

  // Handler untuk klik foto
  const handlePhotoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenPhotoFullPage();
  };

  // Handler untuk Sign In / User Button
  const handleSignInClick = () => {
    if (user) {
      setShowUserDropdown(!showUserDropdown);
    } else {
      router.push('/signin');
    }
  };

  // Handler untuk login dengan GitHub
  const handleGitHubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      console.log("GitHub login successful:", result.user);
      setShowUserDropdown(false);
    } catch (error) {
      console.error("GitHub login error:", error);
      alert("Login dengan GitHub gagal. Silakan coba lagi.");
    }
  };

  // Handler untuk login dengan Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login successful:", result.user);
      setShowUserDropdown(false);
    } catch (error) {
      console.error("Google login error:", error);
      alert("Login dengan Google gagal. Silakan coba lagi.");
    }
  };

  // Handler untuk menuju halaman catatan
  const handleNotesClick = () => {
    setShowUserDropdown(false);
    router.push('/notes');
  };

  // Handler untuk logout
  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    setShowLogoutModal(true);
  };

  // Handler untuk konfirmasi logout
  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
      setUser(null);
      setUserDisplayName("");
      setUserStats(null);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout gagal. Silakan coba lagi.");
    }
  };

  // Handler untuk batal logout
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Handler untuk mengirim komentar ke Firebase
  const handleSendMessage = async () => {
    if (message.trim() === "") {
      alert("Komentar tidak boleh kosong");
      return;
    }
    
    try {
      const userName = user ? userDisplayName : "Anonymous";
      const userId = user ? user.uid : null;
      const userEmail = user ? user.email : null;
      const userAvatar = userName.charAt(0).toUpperCase();
      
      const newComment = {
        photoIndex: currentPhotoIndex,
        text: message.trim(),
        user: userName,
        userId: userId,
        timestamp: serverTimestamp(),
        userAvatar: userAvatar
      };
      
      console.log("Mengirim komentar:", newComment);
      
      const docRef = await addDoc(collection(db, 'photoComments'), newComment);
      console.log("Komentar berhasil dikirim dengan ID:", docRef.id);
      
      // TIDAK LAGI MENGIRIM NOTIFIKASI KOMENTAR
      
      setMessage("");
      
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
      
    } catch (error: any) {
      console.error("Error detail:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let errorMessage = "Gagal mengirim komentar. Silakan coba lagi.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Anda tidak memiliki izin untuk mengirim komentar. Periksa Firebase Rules.";
      } else if (error.code === 'unauthenticated') {
        errorMessage = "Silakan login terlebih dahulu untuk mengirim komentar.";
      }
      
      alert(errorMessage);
    }
  };

  // Handler untuk tekan Enter di input komentar
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handler untuk menutup popup chatbot
  const handleCloseChatbotPopup = () => {
    setShowChatbotPopup(false);
    localStorage.setItem('chatbotPopupShown', 'true');
  };

  // Handler untuk menuju ke halaman chatbot
  const handleGoToChatbot = () => {
    handleCloseChatbotPopup();
    router.push('/chatbot');
  };

  // Handler untuk search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  // Handler untuk key press di search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSearch(false);
    }
  };

  // Data untuk halaman Index
  const indexTopics = [
    {
      id: 1,
      title: "Personal Journey",
      description: "Exploring self-discovery.",
      year: "2024"
    },
    {
      id: 2,
      title: "Creative Process",
      description: "Ideas evolution documentation.",
      year: "2024"
    },
    {
      id: 3,
      title: "Visual Storytelling",
      description: "Photography for personal growth.",
      year: "2024"
    },
    {
      id: 4,
      title: "Emotional Archive",
      description: "Collection of feelings.",
      year: "2024"
    },
    {
      id: 5,
      title: "Growth Metrics",
      description: "Tracking development goals.",
      year: "2024"
    }
  ];

  // Komentar untuk foto saat ini
  const currentPhotoComments = comments.filter(comment => comment.photoIndex === currentPhotoIndex);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>

      {/* Menu Overlay dengan GSAP Animation */}
      <AnimatePresence>
        {showMenuOverlay && (
          <motion.div
            ref={menuOverlayRef}
            key="menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              zIndex: 9995,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transform: 'translateY(-100%)'
            }}
          >
            {/* Tombol Close - Hanya teks X */}
            <motion.div
              onClick={handleCloseMenu}
              style={{
                position: 'absolute',
                top: isMobile ? '1.5rem' : '2rem',
                right: isMobile ? '1.5rem' : '2rem',
                color: 'white',
                fontSize: isMobile ? '2.5rem' : '3rem',
                fontWeight: '300',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif',
                zIndex: 10,
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              whileHover={{ 
                scale: 1.2,
                rotate: 90
              }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.div>
            
            {/* Halaman Kosong - Tidak ada konten lain */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Halaman Full Page MENURU */}
      <AnimatePresence>
        {showMenuruFullPage && (
          <motion.div
            key="menuru-fullpage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              zIndex: 9998,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              overflowY: 'auto',
              paddingBottom: '4rem'
            }}
          >
            {/* Header dengan teks MENURU dan tanda \ di sebelah kanan */}
            <div style={{
              position: 'sticky',
              top: 0,
              left: 0,
              width: '100%',
              padding: isMobile ? '1.5rem' : '3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              boxSizing: 'border-box',
              backgroundColor: 'black',
              zIndex: 10
            }}>
              {/* Container untuk MENURU, angka, dan roles - di kiri */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: isMobile ? '45%' : '40%',
                marginTop: isMobile ? '1rem' : '2rem'
              }}>
                {/* Teks MENURU \ di kiri */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{
                    color: 'white',
                    fontSize: isMobile ? '2.5rem' : '4rem',
                    fontWeight: '300',
                    fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    lineHeight: 1,
                    marginBottom: isMobile ? '2rem' : '3rem'
                  }}
                >
                  MENURU \
                </motion.div>

                {/* Angka 99887 dengan jarak dari judul */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    color: 'white',
                    fontSize: isMobile ? '2rem' : '3rem',
                    fontWeight: '400',
                    fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    letterSpacing: '3px',
                    marginBottom: isMobile ? '3rem' : '4rem'
                  }}
                >
                  99887
                </motion.div>

                {/* Roles List dengan jarak yang cukup */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '2rem' : '3rem'
                  }}
                >
                  {rolesData.map((role, index) => (
                    <motion.div
                      key={role.title}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Role title */}
                      <div style={{
                        color: 'white',
                        fontSize: isMobile ? '1.2rem' : '1.8rem',
                        fontWeight: '500',
                        fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        letterSpacing: '1px',
                        marginBottom: '0.8rem'
                      }}>
                        {role.title}
                      </div>
                      
                      {/* Role description */}
                      <div style={{
                        color: 'white',
                        fontSize: isMobile ? '1rem' : '1.3rem',
                        fontWeight: '400',
                        fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        opacity: 0.9,
                        lineHeight: 1.5
                      }}>
                        {role.description}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Container untuk bagian tengah - DESKRIPSI dan FOTO */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginLeft: isMobile ? '1.5rem' : '4rem',
                marginRight: isMobile ? '1.5rem' : '4rem',
                marginTop: isMobile ? '1rem' : '2rem'
              }}>
                {/* Deskripsi di tengah - BESAR dengan font Formula Condensed */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{
                    color: 'white',
                    fontSize: isMobile ? '1.5rem' : '2.2rem',
                    fontWeight: '700',
                    fontFamily: '"Formula Condensed", sans-serif',
                    lineHeight: 1.7,
                    textAlign: 'left',
                    maxWidth: isMobile ? '90%' : '75%',
                    marginBottom: isMobile ? '4rem' : '5rem',
                    alignSelf: 'flex-start'
                  }}
                >
                  A personal branding journal documenting emotional journeys and creative exploration through visual storytelling and self-discovery narratives.
                </motion.div>

                {/* Foto di bawah deskripsi - BESAR */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{
                    width: isMobile ? '95%' : '80%',
                    height: isMobile ? '350px' : '600px',
                    overflow: 'hidden',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                    border: '3px solid rgba(255,255,255,0.2)',
                    marginBottom: isMobile ? '3rem' : '4rem',
                    alignSelf: 'flex-start'
                  }}
                >
                  <img 
                    src="images/5.jpg" 
                    alt="Menuru Visual"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#333';
                      e.currentTarget.style.display = 'flex';
                      e.currentTarget.style.alignItems = 'center';
                      e.currentTarget.style.justifyContent = 'center';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Menuru Image</div>';
                    }}
                  />
                </motion.div>

                {/* Judul kecil di bawah foto */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  style={{
                    color: 'white',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: '500',
                    fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    opacity: 0.8,
                    marginBottom: isMobile ? '2rem' : '2.5rem',
                    alignSelf: 'flex-start',
                    marginLeft: isMobile ? '0.5rem' : '1rem'
                  }}
                >
                  Visual Journey • 2024 Collection
                </motion.div>

                {/* Teks link tautan besar di bawah judul */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  style={{
                    alignSelf: 'flex-start',
                    marginBottom: isMobile ? '5rem' : '6rem'
                  }}
                >
                  <motion.a
                    href="/explore"
                    style={{
                      color: '#00FF00',
                      fontSize: isMobile ? '1.8rem' : '2.5rem',
                      fontWeight: '600',
                      fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      textDecoration: 'none',
                      letterSpacing: '1px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '1rem',
                      position: 'relative',
                      padding: '1rem 0'
                    }}
                    whileHover={{ 
                      x: 10,
                      color: '#FFFFFF'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    EXPLORE FULL COLLECTION
                    <motion.svg
                      width={isMobile ? "24" : "32"}
                      height={isMobile ? "24" : "32"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      initial={{ x: 0 }}
                      animate={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </motion.svg>
                    {/* Garis bawah animasi */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        left: 0,
                        width: '100%',
                        height: '2px',
                        backgroundColor: '#00FF00'
                      }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                </motion.div>

                {/* Container tambahan untuk konten di bawah tautan */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  style={{
                    width: isMobile ? '95%' : '80%',
                    alignSelf: 'flex-start',
                    marginBottom: isMobile ? '3rem' : '4rem'
                  }}
                >
                  <div style={{
                    color: 'white',
                    fontSize: isMobile ? '1.1rem' : '1.4rem',
                    fontWeight: '300',
                    fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    lineHeight: 1.8,
                    opacity: 0.9
                  }}>
                    This collection represents a year of personal growth and creative experimentation. Each image tells a story of transformation and discovery, captured through the lens of self-reflection.
                  </div>
                </motion.div>
              </div>

              {/* Tanda \ di kanan dengan animasi GSAP - KLIK UNTUK KEMBALI */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onClick={handleCloseMenuruFullPage}
                style={{
                  width: isMobile ? '50px' : '60px',
                  height: isMobile ? '50px' : '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'fixed',
                  right: isMobile ? '1.5rem' : '3rem',
                  top: isMobile ? '1.5rem' : '3rem',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  zIndex: 9999
                }}
                whileHover={{ 
                  scale: 1.2,
                  backgroundColor: 'rgba(0,0,0,0.8)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Tanda \ (backslash) dengan animasi GSAP */}
                <div 
                  ref={backslashRef}
                  style={{
                    position: 'absolute',
                    width: isMobile ? '30px' : '35px',
                    height: '4px',
                    backgroundColor: 'white',
                    borderRadius: '2px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'center'
                  }}
                />
              </motion.div>
            </div>

            {/* Space untuk scroll ke bawah */}
            <div style={{
              height: '100vh',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1, duration: 1 }}
                style={{
                  color: 'white',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '300',
                  fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}
              >
                Scroll for more
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Halaman Full Page untuk Foto dengan Komentar - DESIGN SEDERHANA */}
      <AnimatePresence>
        {showPhotoFullPage && (
          <motion.div
            key="photo-fullpage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              zIndex: 9997,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            {/* Header sederhana dengan tombol close di KIRI */}
            <div style={{
              position: 'sticky',
              top: 0,
              left: 0,
              width: '100%',
              padding: isMobile ? '1rem' : '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 100,
              backgroundColor: 'black',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              {/* Tombol close (×) di kiri */}
              <motion.button
                onClick={handleClosePhotoFullPage}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: isMobile ? '1.8rem' : '2.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Arial, sans-serif',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  order: 1
                }}
                whileHover={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>

              {/* Counter di kanan */}
              <div style={{
                color: 'white',
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.3rem',
                fontFamily: 'Helvetica, Arial, sans-serif',
                order: 2
              }}>
                <span>{String(currentPhotoIndex + 1).padStart(2, '0')}</span>
                <span style={{ opacity: 0.6, fontSize: '0.9em' }}>/</span>
                <span style={{ opacity: 0.6 }}>{totalPhotos}</span>
              </div>
            </div>

            {/* Container utama: foto di atas, komentar di bawah */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              flex: 1
            }}>
              {/* Foto slider - LEBIH PANJANG KE BAWAH */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '1rem' : '2rem',
                paddingTop: '0',
                paddingBottom: '1rem'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '800px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhotoIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: '100%',
                        maxWidth: '600px',
                        height: isMobile ? '70vh' : '80vh',
                        position: 'relative',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                        border: '2px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const width = rect.width;
                        
                        if (clickX < width / 2) {
                          prevPhoto();
                        } else {
                          nextPhoto();
                        }
                      }}
                    >
                      <img 
                        src={progressPhotos[currentPhotoIndex].src}
                        alt={progressPhotos[currentPhotoIndex].alt}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.backgroundColor = '#222';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.innerHTML = `<div style="padding: 2rem; text-align: center;">Photo ${currentPhotoIndex + 1}</div>`;
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Progress bar kecil di bawah foto */}
              <div style={{
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto 2rem auto',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0 1rem'
              }}>
                {progressPhotos.map((_, index) => (
                  <div 
                    key={index}
                    style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: index === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.2)',
                      borderRadius: '2px',
                      transition: 'background-color 0.3s ease'
                    }}
                  />
                ))}
              </div>

              {/* Waktu update */}
              <div style={{
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto 1.5rem auto',
                padding: '0 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {photoTimeAgo[currentPhotoIndex]}
              </div>

              {/* Area komentar di bawah foto (bisa di-scroll) */}
              <div style={{
                flex: 1,
                padding: isMobile ? '1rem' : '2rem',
                paddingTop: '0',
                maxWidth: '800px',
                margin: '0 auto',
                width: '100%'
              }}>
                {/* Input komentar */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      flex: 1,
                      position: 'relative'
                    }}>
                      <input
                        ref={messageInputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tulis komentar..."
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem',
                          paddingRight: '3rem',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '20px',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '0.75rem'
                      }}>
                        Enter
                      </span>
                    </div>
                    
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={message.trim() === ""}
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: message.trim() === "" ? 'rgba(0, 80, 183, 0.5)' : '#0050B7',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: message.trim() === "" ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        flexShrink: 0
                      }}
                      whileHover={message.trim() !== "" ? { 
                        scale: 1.1,
                        backgroundColor: '#0066CC'
                      } : {}}
                      whileTap={message.trim() !== "" ? { scale: 0.95 } : {}}
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                      >
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </motion.button>
                  </div>
                  
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <span style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.75rem'
                    }}>
                      {user ? `Login sebagai: ${userDisplayName}` : 'Komentar sebagai: Anonymous'}
                    </span>
                  </div>
                </div>

                {/* Header komentar */}
                <div style={{
                  marginBottom: '1.5rem',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h3 style={{
                    fontSize: isMobile ? '1.2rem' : '1.4rem',
                    fontWeight: '600',
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Komentar ({currentPhotoComments.length})
                  </h3>
                </div>

                {/* Daftar komentar */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  paddingBottom: '3rem'
                }}>
                  {isLoadingComments ? (
                    <div style={{
                      color: 'rgba(255,255,255,0.5)',
                      textAlign: 'center',
                      padding: '2rem',
                      fontSize: '0.9rem'
                    }}>
                      Memuat komentar...
                    </div>
                  ) : currentPhotoComments.length === 0 ? (
                    <div style={{
                      color: 'rgba(255,255,255,0.5)',
                      textAlign: 'center',
                      padding: '2rem',
                      fontSize: '0.9rem'
                    }}>
                      Belum ada komentar untuk foto ini.
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                        Jadilah yang pertama berkomentar!
                      </div>
                    </div>
                  ) : (
                    currentPhotoComments.map((comment, index) => (
                      <motion.div
                        key={comment.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          padding: '1rem',
                          borderRadius: '8px',
                          borderLeft: '3px solid #0050B7'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.8rem',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            minWidth: '32px',
                            borderRadius: '50%',
                            backgroundColor: user && comment.user === userDisplayName ? '#0050B7' : '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            {comment.userAvatar || comment.user.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '0.3rem'
                            }}>
                              <span style={{
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                              }}>
                                {comment.user}
                                {user && comment.user === userDisplayName && (
                                  <span style={{
                                    marginLeft: '0.5rem',
                                    fontSize: '0.7rem',
                                    backgroundColor: '#0050B7',
                                    color: 'white',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px'
                                  }}>
                                    Anda
                                  </span>
                                )}
                              </span>
                              <span style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap'
                              }}>
                                {calculateTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p style={{
                              color: 'white',
                              margin: 0,
                              fontSize: '0.9rem',
                              lineHeight: 1.4
                            }}>
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Logout Confirmation */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)'
            }}
            onClick={handleCancelLogout}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                borderRadius: '15px',
                padding: isMobile ? '1.5rem' : '2rem',
                width: isMobile ? '90%' : '400px',
                maxWidth: '500px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  color: 'white',
                  fontSize: isMobile ? '1.3rem' : '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  Logout
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  Apakah Anda yakin ingin keluar dari akun {userDisplayName}?
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <motion.button
                  onClick={handleCancelLogout}
                  style={{
                    flex: 1,
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Tidak
                </motion.button>
                <motion.button
                  onClick={handleConfirmLogout}
                  style={{
                    flex: 1,
                    padding: '0.8rem 1.5rem',
                    backgroundColor: '#0050B7',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ 
                    backgroundColor: '#0066CC'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ya, Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    {/* Notification Dropdown - DIPERBARUI LENGKAP */}
<AnimatePresence>
  {showNotification && (
    <motion.div
      ref={notificationDropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: isMobile ? '6rem' : '7.5rem',
        right: isMobile ? '5.5rem' : '7rem',
        backgroundColor: 'rgba(20, 20, 20, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '15px',
        padding: '1rem 0',
        width: isMobile ? '320px' : '450px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        zIndex: 1001,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header Notifikasi */}
      <div style={{
        padding: '0 1.5rem 1rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.3rem',
          fontWeight: '600',
          margin: 0,
          fontFamily: 'Helvetica, Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications
          {notificationCount > 0 && (
            <span style={{
              backgroundColor: '#FF4757',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: '700',
              padding: '0.1rem 0.6rem',
              borderRadius: '10px',
              marginLeft: '0.5rem'
            }}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {notifications.length > 0 && hasUnreadNotifications && (
            <motion.button
              onClick={handleClearNotification}
              style={{
                backgroundColor: 'rgba(255, 71, 87, 0.2)',
                border: '1px solid rgba(255, 71, 87, 0.4)',
                color: '#FF4757',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
              whileHover={{ 
                backgroundColor: 'rgba(255, 71, 87, 0.3)',
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All
            </motion.button>
          )}
          
          {/* Tombol refresh */}
          <motion.button
            onClick={() => {
              setIsLoadingNotifications(true);
              // Simulate refresh
              setTimeout(() => setIsLoadingNotifications(false), 500);
            }}
            style={{
              backgroundColor: 'rgba(0, 80, 183, 0.2)',
              border: '1px solid rgba(0, 80, 183, 0.4)',
              color: '#0050B7',
              fontSize: '0.8rem',
              fontWeight: '600',
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}
            whileHover={{ 
              backgroundColor: 'rgba(0, 80, 183, 0.3)',
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
          >
            Refresh
          </motion.button>
        </div>
      </div>
      
      {/* List Notifikasi - DIPERBAIKI */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem 0',
        minHeight: '200px'
      }}>
        {isLoadingNotifications ? (
          <div style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ marginBottom: '1rem' }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </motion.div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}>
            <div style={{ 
              fontSize: '3rem',
              marginBottom: '1rem',
              opacity: 0.5
            }}>
              🔔
            </div>
            <h4 style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem',
              margin: '0 0 0.5rem 0'
            }}>
              No notifications yet
            </h4>
            <p style={{
              fontSize: '0.9rem',
              margin: '0 0 1.5rem 0',
              color: 'rgba(255, 255, 255, 0.4)'
            }}>
              Check back later for updates
            </p>
            <motion.button
              onClick={async () => {
                // Tambahkan notifikasi contoh
                const exampleNotification = {
                  title: "Welcome to MENURU!",
                  message: "This is an example notification. You'll see real notifications here when they're available.",
                  type: 'announcement' as const,
                  isAdminPost: true,
                  adminName: 'System',
                  priority: 'low' as const,
                  category: 'general' as const
                };
                
                const success = await sendNotification(exampleNotification);
                if (success) {
                  alert("Example notification added! Refresh to see.");
                }
              }}
              style={{
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                border: '1px solid rgba(0, 255, 0, 0.3)',
                color: '#00FF00',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
              whileHover={{ backgroundColor: 'rgba(0, 255, 0, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              Add Example Notification
            </motion.button>
          </div>
        ) : (
          <div>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: notification.isRead ? 'transparent' : getBgColorByType(notification.type),
                  position: 'relative'
                }}
                whileHover={{ 
                  backgroundColor: notification.read ? 'rgba(255, 255, 255, 0.05)' : getBgColorByType(notification.type).replace('0.1', '0.2')
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Unread Indicator */}
                {!notification.read && (
                  <div style={{
                    position: 'absolute',
                    left: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    backgroundColor: getColorByType(notification.type),
                    borderRadius: '50%'
                  }} />
                )}
                
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}>
                  {/* Notification Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    borderRadius: '10px',
                    backgroundColor: notification.read ? 'rgba(255, 255, 255, 0.1)' : `${getColorByType(notification.type)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: getColorByType(notification.type)
                  }}>
                    {notification.icon}
                  </div>
                  
                  {/* Notification Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.3rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <h4 style={{
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '600',
                          margin: 0,
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          {notification.title}
                        </h4>
                        
                        {/* Badge Type */}
                        <span style={{
                          backgroundColor: getColorByType(notification.type),
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {notification.type}
                        </span>
                        
                        {/* Badge Admin */}
                        {notification.isAdminPost && (
                          <span style={{
                            backgroundColor: '#8B5CF6',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '4px'
                          }}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap'
                      }}>
                        {calculateTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p style={{
                      color: notification.read ? 'rgba(255, 255, 255, 0.7)' : 'white',
                      fontSize: '0.9rem',
                      margin: '0 0 0.5rem 0',
                      lineHeight: 1.4,
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      wordBreak: 'break-word'
                    }}>
                      {notification.message}
                    </p>
                    
                    {/* Admin info jika ada */}
                    {notification.isAdminPost && notification.adminName && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        marginTop: '0.3rem'
                      }}>
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.75rem'
                        }}>
                          From:
                        </span>
                        <span style={{
                          color: '#8B5CF6',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {notification.adminName}
                        </span>
                      </div>
                    )}
                    
                    {/* Priority dan Category */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {notification.priority && (
                        <span style={{
                          color: notification.priority === 'high' ? '#EF4444' : 
                                 notification.priority === 'medium' ? '#F59E0B' : '#10B981',
                          fontSize: '0.7rem',
                          fontWeight: '500',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          {notification.priority.toUpperCase()}
                        </span>
                      )}
                      
                      {notification.category && (
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          {notification.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer dengan statistik */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.8rem',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}>
          {notifications.length} total • {notificationCount} unread
        </div>
        
        <motion.a
          href="/notifications"
          style={{
            color: '#00FF00',
            fontSize: '0.9rem',
            fontWeight: '600',
            textDecoration: 'none',
            fontFamily: 'Helvetica, Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          whileHover={{ 
            color: 'white',
            x: 5
          }}
        >
          View All
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </motion.a>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* POPUP CHATBOT - DI KANAN BAWAH */}
      <AnimatePresence>
        {showChatbotPopup && (
          <motion.div
            ref={chatbotPopupRef}
            initial={{ opacity: 0, x: 100, y: 100 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 100 }}
            transition={{ 
              duration: 0.5,
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            style={{
              position: 'fixed',
              bottom: isMobile ? '1rem' : '2rem',
              right: isMobile ? '1rem' : '2rem',
              zIndex: 9996,
              maxWidth: isMobile ? 'calc(100% - 2rem)' : '400px',
              width: isMobile ? '90%' : '380px'
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 0, 0.2)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Header dengan Tombol Close */}
              <div style={{
                padding: isMobile ? '1.2rem 1.2rem 0.8rem 1.2rem' : '1.5rem 1.5rem 1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem'
                }}>
                  <div style={{
                    width: isMobile ? '45px' : '50px',
                    height: isMobile ? '45px' : '50px',
                    borderRadius: '12px',
                    backgroundColor: '#00FF00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg 
                      width={isMobile ? "25" : "28"} 
                      height={isMobile ? "25" : "28"} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="black" 
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  
                  <div>
                    <div style={{
                      color: '#00FF00',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '0.2rem'
                    }}>
                      AI Assistant
                    </div>
                    <h3 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      fontWeight: '700',
                      margin: 0,
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      lineHeight: 1.2
                    }}>
                      Chatbot AI
                    </h3>
                  </div>
                </div>

                {/* Tombol Close */}
                <motion.button
                  onClick={handleCloseChatbotPopup}
                  style={{
                    width: isMobile ? '32px' : '36px',
                    height: isMobile ? '32px' : '36px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    color: 'white',
                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    margin: 0,
                    flexShrink: 0
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    scale: 1.1
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>

              {/* Konten */}
              <div style={{
                padding: isMobile ? '1.2rem' : '1.5rem'
              }}>
                {/* Deskripsi */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  style={{
                    marginBottom: '1.5rem'
                  }}
                >
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    lineHeight: 1.5,
                    margin: '0 0 1rem 0'
                  }}>
                    Coba chatbot AI cerdas kami! Dapatkan bantuan instan, jawaban cepat, dan pengalaman chatting yang lebih personal.
                  </p>
                  
                  {/* Fitur-fitur */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    marginTop: '1rem'
                  }}>
                    {[
                      "🤖 AI dengan teknologi terbaru",
                      "⚡ Respon dalam hitungan detik",
                      "🔐 Privasi data terjamin",
                      "🎯 Solusi personal untuk Anda"
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 255, 0, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00FF00" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.9rem'
                        }}>
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Foto/Ilustrasi Chatbot */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  style={{
                    width: '100%',
                    height: isMobile ? '120px' : '140px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    border: '2px solid rgba(0, 255, 0, 0.2)'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 255, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '0.8rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      {[1, 2, 3].map((dot) => (
                        <motion.div
                          key={dot}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            delay: dot * 0.2
                          }}
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#00FF00',
                            borderRadius: '50%'
                          }}
                        />
                      ))}
                    </div>
                    <div style={{
                      color: '#00FF00',
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      AI Chatbot Siap Membantu
                    </div>
                  </div>
                </motion.div>

                {/* Tombol Action */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem'
                  }}
                >
                  {/* Tombol Utama */}
                  <motion.button
                    onClick={handleGoToChatbot}
                    style={{
                      backgroundColor: '#00FF00',
                      color: 'black',
                      border: 'none',
                      padding: isMobile ? '0.9rem' : '1rem',
                      borderRadius: '12px',
                      fontSize: isMobile ? '1rem' : '1.05rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      backgroundColor: '#00CC00',
                      boxShadow: '0 10px 20px rgba(0, 255, 0, 0.3)'
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Coba Sekarang - Gratis
                    <motion.div
                      initial={{ x: -100 }}
                      animate={{ x: 400 }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '50px',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                        transform: 'skewX(-20deg)'
                      }}
                    />
                  </motion.button>

                  {/* Tombol Secondary */}
                  <motion.button
                    onClick={handleCloseChatbotPopup}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: isMobile ? '0.7rem' : '0.8rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Nanti Saja
                  </motion.button>
                </motion.div>

                {/* Info Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  style={{
                    textAlign: 'center',
                    marginTop: '1rem',
                    paddingTop: '0.8rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem',
                    display: 'block'
                  }}>
                    Tidak perlu registrasi • 100% gratis • Coba sekarang juga!
                  </span>
                </motion.div>
              </div>

              {/* Efek Cahaya */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 80% 20%, rgba(0, 255, 0, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: -1
              }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teks "Selamat Tahun Baru 2026" di pojok kiri atas */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          position: 'fixed',
          top: isMobile ? '0.8rem' : '1rem',
          left: isMobile ? '1rem' : '2rem',
          color: 'white',
          fontSize: isMobile ? '1rem' : '1.2rem',
          fontWeight: '300',
          fontFamily: 'Helvetica, Arial, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          backdropFilter: 'blur(5px)'
        }}
      >
        Selamat Tahun Baru 2026
      </motion.div>

      {/* User Dropdown Menu */}
      <AnimatePresence>
        {showUserDropdown && user && (
          <motion.div
            ref={userDropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: isMobile ? '6rem' : '7.5rem',
              right: isMobile ? '1rem' : '2rem',
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '0.8rem 0',
              minWidth: '200px',
              zIndex: 1001,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* User Info */}
            <div style={{
              padding: '0.8rem 1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#0050B7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                flexShrink: 0
              }}>
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {userDisplayName}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.75rem',
                  marginTop: '0.2rem'
                }}>
                  {user.email}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0.5rem 0'
            }}>
              <motion.button
                onClick={handleNotesClick}
                style={{
                  padding: '0.8rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}
                whileHover={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  paddingLeft: '1.2rem'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Catatan Saya
              </motion.button>

              <motion.button
                onClick={handleLogoutClick}
                style={{
                  padding: '0.8rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ff6b6b',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}
                whileHover={{ 
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  paddingLeft: '1.2rem'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </motion.button>
            </div>

            {/* Stats Section */}
            {userStats && (
              <div style={{
                padding: '0.8rem 1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.3rem'
                }}>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem'
                  }}>
                    Login Anda:
                  </span>
                  <span style={{
                    color: '#00FF00',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {userStats.loginCount || 0} kali
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.3rem'
                }}>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem'
                  }}>
                    Total Users:
                  </span>
                  <span style={{
                    color: '#0050B7',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {totalUsers}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem'
                  }}>
                    Total Login:
                  </span>
                  <span style={{
                    color: '#F59E0B',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {totalLoggedInUsers}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <div 
        ref={topNavRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          padding: isMobile ? '0.8rem 1rem' : '1rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 101,
          boxSizing: 'border-box',
          opacity: 1,
          marginTop: isMobile ? '2.5rem' : '3rem'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '1rem' : '2rem',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          borderRadius: '50px',
          padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {/* Docs */}
          <motion.div
            onClick={() => router.push('/docs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.4rem 1rem 0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              Docs
              <svg 
                width={isMobile ? "12" : "14"} 
                height={isMobile ? "12" : "14"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#6366F1"
                strokeWidth="2"
              >
                <path d="M7 7l10 10" />
                <path d="M17 7v10H7" />
              </svg>
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Chatbot */}
          <motion.div
            data-nav-chatbot
            onClick={() => router.push('/chatbot')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.4rem 1rem 0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="8" y1="7" x2="16" y2="7"/>
              <line x1="8" y1="11" x2="12" y2="11"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              Chatbot
              <svg 
                width={isMobile ? "12" : "14"} 
                height={isMobile ? "12" : "14"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#6366F1"
                strokeWidth="2"
              >
                <path d="M7 7l10 10" />
                <path d="M17 7v10H7" />
              </svg>
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Update */}
          <motion.div
            onClick={() => router.push('/update')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.4rem 1rem 0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              Update
              <svg 
                width={isMobile ? "12" : "14"} 
                height={isMobile ? "12" : "14"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#6366F1"
                strokeWidth="2"
              >
                <path d="M7 7l10 10" />
                <path d="M17 7v10H7" />
              </svg>
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            onClick={() => router.push('/timeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.4rem 1rem 0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              <line x1="12" y1="7" x2="12" y2="13"/>
              <line x1="16" y1="11" x2="12" y2="7"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              Timeline
              <svg 
                width={isMobile ? "12" : "14"} 
                height={isMobile ? "12" : "14"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#6366F1"
                strokeWidth="2"
              >
                <path d="M7 7l10 10" />
                <path d="M17 7v10H7" />
              </svg>
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>
        </div>
      </div>

      {/* Header Section */}
      <div 
        ref={headerRef}
        style={{
          position: 'fixed',
          top: isMobile ? '5rem' : '6rem',
          left: 0,
          width: '100%',
          padding: isMobile ? '1rem' : '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          boxSizing: 'border-box',
          opacity: 1
        }}
      >
        {/* Left: "MENURU" saja */}
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div style={{
              fontSize: isMobile ? '1.5rem' : '2.5rem',
              fontWeight: '300',
              fontFamily: 'Helvetica, Arial, sans-serif',
              margin: 0,
              letterSpacing: '2px',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: 'white',
              minHeight: isMobile ? '1.8rem' : '2.8rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              ME
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.span
                    key={loadingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'inline-block'
                    }}
                  >
                    {loadingText}
                  </motion.span>
                ) : (
                  <motion.span
                    key="nuru-final"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    NURU
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        

        {/* Right Side Buttons - DENGAN SEARCH DAN NOTIFIKASI BARU */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.8rem' : '1rem',
          position: 'relative'
        }}>
          {/* Search Bar dengan animasi GSAP */}
          <motion.div
            ref={searchContainerRef}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            {/* Search Icon */}
            <motion.div
              onClick={() => setShowSearch(!showSearch)}
              style={{
                position: 'absolute',
                left: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '100%',
                cursor: 'pointer',
                zIndex: 2
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={showSearch ? "#00FF00" : "white"} 
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </motion.div>
            
            {/* Search Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              placeholder="Search..."
              style={{
                width: '100%',
                height: '100%',
                padding: '0 40px 0 35px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'Helvetica, Arial, sans-serif',
                opacity: showSearch ? 1 : 0,
                pointerEvents: showSearch ? 'auto' : 'none',
                transition: 'opacity 0.2s ease'
              }}
            />
            
            {/* Clear/X Button */}
            {showSearch && searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSearchQuery("")}
                style={{
                  position: 'absolute',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }}
                whileHover={{ scale: 1.2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                whileTap={{ scale: 0.9 }}
              >
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </motion.div>
            )}
          </motion.div>

          {/* Notification Bell dengan Badge */}
          <motion.div
            ref={notificationRef}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.05, duration: 0.5 }}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowNotification(!showNotification)}
            whileHover={{ 
              scale: 1.1,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Bell Icon */}
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            
            {/* Notification Badge */}
            {hasUnreadNotifications && notificationCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '18px',
                  height: '18px',
                  backgroundColor: '#FF4757',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid black'
                }}
              >
                <span style={{
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  padding: '0 4px'
                }}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </motion.div>
            )}
            
            {/* Pulse Animation untuk unread notifications */}
            {hasUnreadNotifications && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#FF4757',
                  borderRadius: '50%',
                  zIndex: -1
                }}
              />
            )}
          </motion.div>

          {/* User Stats Badge */}
          {user && userStats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(0, 80, 183, 0.3)',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                border: '1px solid rgba(0, 80, 183, 0.5)',
                backdropFilter: 'blur(5px)',
                marginRight: '0.5rem'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF00" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span style={{
                color: '#00FF00',
                fontSize: '0.8rem',
                fontWeight: '600',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                {userStats.loginCount || 0}
              </span>
            </motion.div>
          )}

          {/* Tombol MENU */}
          <motion.div
            onClick={handleOpenMenu}
            style={{
              color: 'white',
              fontSize: isMobile ? '1rem' : '1.5rem',
              fontWeight: '400',
              fontFamily: 'Helvetica, Arial, sans-serif',
              cursor: 'pointer',
              padding: isMobile ? '0.3rem 0.8rem' : '0.5rem 1rem',
              whiteSpace: 'nowrap',
              letterSpacing: '1px',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            whileHover={{ 
              color: '#00FF00',
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
          >
            MENU
          </motion.div>

          {/* Sign In / User Button */}
          <motion.button
            ref={userButtonRef}
            onClick={handleSignInClick}
            onMouseEnter={() => setIsHoveringSignIn(true)}
            onMouseLeave={() => setIsHoveringSignIn(false)}
            style={{
              padding: isMobile ? '0.4rem 1rem' : '0.6rem 1.5rem',
              fontSize: isMobile ? '0.9rem' : '1.5rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'Helvetica, Arial, sans-serif',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.3rem' : '0.5rem',
              margin: 0,
              maxWidth: isMobile ? '180px' : '250px',
              minWidth: isMobile ? '120px' : '180px',
              height: isMobile ? '40px' : '50px',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ 
              backgroundColor: 'rgba(255,255,255,0.1)',
              scale: 1.05,
              border: '1px solid rgba(255,255,255,0.3)',
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            {user ? (
              <>
                {/* Icon user */}
                <svg 
                  width={isMobile ? "18" : "30"} 
                  height={isMobile ? "18" : "30"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    flexShrink: 0,
                    marginRight: '0.5rem'
                  }}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                
                {/* Nama user */}
                <div style={{
                  overflow: 'hidden',
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <motion.span
                    ref={userTextRef}
                    style={{
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      paddingRight: '20px',
                      transform: isNameScrolling ? `translateX(${scrollPosition}px)` : 'translateX(0)',
                      willChange: 'transform'
                    }}
                  >
                    {isHoveringSignIn ? `Hi, ${userDisplayName}` : userDisplayName}
                  </motion.span>
                  
                  {isHoveringSignIn && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.8em'
                      }}
                    >
                      ↓
                    </motion.span>
                  )}
                </div>
              </>
            ) : (
              <>
                <svg 
                  width={isMobile ? "18" : "30"} 
                  height={isMobile ? "18" : "30"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    flexShrink: 0,
                    marginRight: '0.5rem'
                  }}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  SIGN IN
                </span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{
        width: '100%',
        paddingTop: isMobile ? '12rem' : '15rem',
        boxSizing: 'border-box',
        zIndex: 10,
        position: 'relative'
      }}>

        {/* PRODUCT AND Image Section - DI BAWAH JUDUL WEBSITE */}
        <div style={{
          width: '100%',
          padding: isMobile ? '1.5rem' : '3rem',
          marginTop: isMobile ? '1rem' : '2rem',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.1rem' : '0.2rem'
        }}>
          
          {/* Baris 1: PRODUCT + AND + Foto + 01 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between'
          }}>
            {/* PRODUCT - Di kiri */}
            <div style={{
              textAlign: 'left',
              height: isMobile ? '5rem' : '7rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <h2 style={{
                color: 'white',
                fontSize: isMobile ? '5rem' : '7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '-3px',
                margin: 0,
                lineHeight: 0.8,
                padding: 0
              }}>
                PRODUCT
              </h2>
            </div>

            {/* AND + Foto Container - Di kanan, dekat satu sama lain */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '1rem'
            }}>
              {/* AND */}
              <div style={{
                textAlign: 'center',
                height: isMobile ? '5rem' : '7rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <h2 style={{
                  color: 'white',
                  fontSize: isMobile ? '5rem' : '7rem',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '-3px',
                  margin: 0,
                  lineHeight: 0.8,
                  padding: 0
                }}>
                  AND
                </h2>
              </div>

              {/* Container Foto + Angka 01 */}
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end'
              }}>
                {/* Foto */}
                <div style={{
                  width: isMobile ? '140px' : '180px',
                  height: isMobile ? '5rem' : '7rem',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: '#222'
                }}>
                  <img 
                    src="images/5.jpg" 
                    alt="Product Image"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
                
                {/* Angka 01 */}
                <div style={{
                  position: 'absolute',
                  bottom: '-0.8rem',
                  right: '-1.5rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '400',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '1px'
                }}>
                  01
                </div>
              </div>
            </div>
          </div>

          {/* Baris 2: Foto + VISUAL DESIGNER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'flex-start',
            gap: isMobile ? '4rem' : '8rem'
          }}>
            {/* Container Foto + Angka 02 - Di kiri */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end'
            }}>
              {/* Foto */}
              <div style={{
                width: isMobile ? '140px' : '180px',
                height: isMobile ? '5rem' : '7rem',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: '#222'
              }}>
                <img 
                  src="images/5.jpg" 
                  alt="Visual Designer"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
              
              {/* Angka 02 */}
              <div style={{
                position: 'absolute',
                bottom: '-0.8rem',
                right: '-1.5rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '400',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '1px'
              }}>
                02
              </div>
            </div>

            {/* VISUAL DESIGNER - 1 baris */}
            <div style={{
              textAlign: 'left',
              height: isMobile ? '5rem' : '7rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <h2 style={{
                color: 'white',
                fontSize: isMobile ? '5rem' : '7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '-3px',
                margin: 0,
                lineHeight: 0.8,
                whiteSpace: 'nowrap'
              }}>
                VISUAL DESIGNER
              </h2>
            </div>
          </div>

          {/* Baris 3: BASED + Foto + IN */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between'
          }}>
            {/* BASED - Kiri */}
            <div style={{
              textAlign: 'left',
              height: isMobile ? '5rem' : '7rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <h2 style={{
                color: 'white',
                fontSize: isMobile ? '5rem' : '7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '-3px',
                margin: 0,
                lineHeight: 0.8
              }}>
                BASED
              </h2>
            </div>

            {/* Container Foto + Angka 03 */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end'
            }}>
              {/* Foto */}
              <div style={{
                width: isMobile ? '140px' : '180px',
                height: isMobile ? '5rem' : '7rem',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: '#222'
              }}>
                <img 
                  src="images/5.jpg" 
                  alt="Based"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
              
              {/* Angka 03 */}
              <div style={{
                position: 'absolute',
                bottom: '-0.8rem',
                right: '-1.5rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '400',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '1px'
              }}>
                03
              </div>
            </div>

            {/* IN - Kanan */}
            <div style={{
              textAlign: 'right',
              height: isMobile ? '5rem' : '7rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}>
              <h2 style={{
                color: 'white',
                fontSize: isMobile ? '5rem' : '7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '-3px',
                margin: 0,
                lineHeight: 0.8
              }}>
                IN
              </h2>
            </div>
          </div>

          {/* Baris 4: Foto + INDONESIA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'flex-start',
            gap: isMobile ? '4rem' : '8rem'
          }}>
            {/* Container Foto + Angka 04 - Di kiri */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end'
            }}>
              {/* Foto */}
              <div style={{
                width: isMobile ? '140px' : '180px',
                height: isMobile ? '5rem' : '7rem',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: '#222'
              }}>
                <img 
                  src="images/5.jpg" 
                  alt="Footer Image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
              
              {/* Angka 04 */}
              <div style={{
                position: 'absolute',
                bottom: '-0.8rem',
                right: '-1.5rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '400',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '1px'
              }}>
                04
              </div>
            </div>

            {/* INDONESIA */}
            <div style={{
              textAlign: 'left',
              height: isMobile ? '5rem' : '7rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <h2 style={{
                color: 'white',
                fontSize: isMobile ? '5rem' : '7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '-3px',
                margin: 0,
                lineHeight: 0.8
              }}>
                INDONESIA
              </h2>
            </div>
          </div>

        </div>
        
        {/* Spacer kecil sebelum konten berikutnya */}
        <div style={{
          height: isMobile ? '3rem' : '4rem',
          width: '100%'
        }} />

        {/* AnimatePresence untuk transisi antara view */}
        <AnimatePresence mode="wait">
          {currentView === "main" && (
            <motion.div
              key="main-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Container untuk Tombol Slider dan Teks MENURU */}
              <div style={{
                position: 'relative',
                marginTop: isMobile ? '4rem' : '5rem',
                marginBottom: isMobile ? '4rem' : '6rem',
                paddingLeft: isMobile ? '2rem' : '4rem',
                paddingRight: isMobile ? '2rem' : '4rem',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '2rem' : '0'
              }}>
                {/* Tombol Slider Index/Grid di kiri */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <motion.button
                    onClick={toggleSlider}
                    style={{
                      width: '120px',
                      height: '50px',
                      backgroundColor: '#0050B7',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 15px',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: sliderPosition === "index" ? 1 : 0.5
                      }}>
                        INDEX
                      </span>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: sliderPosition === "grid" ? 1 : 0.5
                      }}>
                        GRID
                      </span>
                    </div>
                    
                    <motion.div
                      animate={{ x: sliderPosition === "index" ? 15 : 65 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{
                        width: '35px',
                        height: '35px',
                        backgroundColor: '#00FF00',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: '7px',
                        boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)'
                      }}
                    />
                  </motion.button>

                  <div style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    {sliderPosition === "index" ? "Index View" : "Grid View"}
                  </div>
                </div>

                {/* Teks MENURU dengan animasi Plus (+) */}
                <motion.div
                  ref={menuruButtonRef}
                  onClick={handleMenuruClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginTop: isMobile ? '1rem' : '0',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div style={{
                    color: 'white',
                    fontSize: isMobile ? '1.8rem' : '2rem',
                    fontWeight: '300',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    position: 'relative'
                  }}>
                    MENURU
                  </div>
                  
                  <div 
                    ref={plusSignRef}
                    className="plus-sign" 
                    style={{
                      width: isMobile ? '35px' : '40px',
                      height: isMobile ? '35px' : '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      marginLeft: '0.5rem'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      width: '2px',
                      height: isMobile ? '18px' : '20px',
                      backgroundColor: 'white',
                      borderRadius: '1px'
                    }} />
                    <div style={{
                      position: 'absolute',
                      width: isMobile ? '18px' : '20px',
                      height: '2px',
                      backgroundColor: 'white',
                      borderRadius: '1px'
                    }} />
                  </div>
                </motion.div>
              </div>

              {/* Foto Card Design Section - 6 Card Horizontal */}
              <div style={{
                width: '100%',
                padding: isMobile ? '0.5rem' : '1rem',
                marginTop: isMobile ? '2rem' : '3rem',
                marginBottom: isMobile ? '3rem' : '4rem',
                boxSizing: 'border-box',
                position: 'relative'
              }}>
                {/* Judul di Atas Foto - Kiri Tengah */}
                <div style={{
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  paddingLeft: isMobile ? '1rem' : '2rem'
                }}>
                  <div style={{
                    color: 'white',
                    fontSize: isMobile ? '1.3rem' : '1.6rem',
                    fontWeight: '400',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Design Collection
                  </div>
                </div>

                {/* Container 6 Foto Card Horizontal - Tengah */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: isMobile ? '0.8rem' : '1rem',
                  padding: isMobile ? '0 0.5rem' : '0 1rem',
                  margin: '0 auto',
                  width: '100%',
                  flexWrap: 'wrap',
                  maxWidth: '1400px'
                }}>
                  
                  {/* Card 1 dengan Link */}
                  <a 
                    href="/visual-design" 
                    style={{
                      textDecoration: 'none',
                      position: 'relative',
                      width: isMobile ? '180px' : '220px',
                      height: isMobile ? '250px' : '320px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'block'
                    }}
                  >
                    {/* Foto Murni */}
                    <img 
                      src="images/5.jpg" 
                      alt="Visual Design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff;">Visual Design</div>';
                      }}
                    />
                    
                    {/* Container Teks dan SVG di Bawah - Sejajar */}
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 1rem',
                      boxSizing: 'border-box'
                    }}>
                      {/* Teks Lengkap - Normal */}
                      <div style={{
                        color: 'black',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: '400',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        Visual Design
                      </div>
                      
                      {/* SVG Panah Serong Kanan Modern */}
                      <div style={{
                        marginLeft: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg
                          width={isMobile ? "16" : "18"}
                          height={isMobile ? "16" : "18"}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Panah serong kanan modern */}
                          <path 
                            d="M7 17L17 7M17 7H7M17 7V17" 
                            stroke="black" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>

                  {/* Card 2 dengan Link */}
                  <a 
                    href="/brand-identity" 
                    style={{
                      textDecoration: 'none',
                      position: 'relative',
                      width: isMobile ? '180px' : '220px',
                      height: isMobile ? '250px' : '320px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'block'
                    }}
                  >
                    <img 
                      src="images/5.jpg" 
                      alt="Brand Identity"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff;">Brand Identity</div>';
                      }}
                    />
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 1rem',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: '400',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        Brand Identity
                      </div>
                      
                      <div style={{
                        marginLeft: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg
                          width={isMobile ? "16" : "18"}
                          height={isMobile ? "16" : "18"}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M7 17L17 7M17 7H7M17 7V17" 
                            stroke="black" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>

                  {/* Card 3 dengan Link */}
                  <a 
                    href="/ui-ux-design" 
                    style={{
                      textDecoration: 'none',
                      position: 'relative',
                      width: isMobile ? '180px' : '220px',
                      height: isMobile ? '250px' : '320px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'block'
                    }}
                  >
                    <img 
                      src="images/5.jpg" 
                      alt="UI/UX Design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff;">UI/UX Design</div>';
                      }}
                    />
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 1rem',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: '400',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        UI/UX Design
                      </div>
                      
                      <div style={{
                        marginLeft: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg
                          width={isMobile ? "16" : "18"}
                          height={isMobile ? "16" : "18"}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M7 17L17 7M17 7H7M17 7V17" 
                            stroke="black" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>

                  {/* Card 4 dengan Link */}
                  <a 
                    href="/motion-graphics" 
                    style={{
                      textDecoration: 'none',
                      position: 'relative',
                      width: isMobile ? '180px' : '220px',
                      height: isMobile ? '250px' : '320px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'block'
                    }}
                  >
                    <img 
                      src="images/5.jpg" 
                      alt="Motion Graphics"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff;">Motion Graphics</div>';
                      }}
                    />
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 1rem',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: '400',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        Motion Graphics
                      </div>
                      
                      <div style={{
                        marginLeft: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg
                          width={isMobile ? "16" : "18"}
                          height={isMobile ? "16" : "18"}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M7 17L17 7M17 7H7M17 7V17" 
                            stroke="black" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>

                  {/* Card 5 dengan Link */}
                  <a 
                    href="/print-design" 
                    style={{
                      textDecoration: 'none',
                      position: 'relative',
                      width: isMobile ? '180px' : '220px',
                      height: isMobile ? '250px' : '320px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'block'
                    }}
                  >
                    <img 
                      src="images/5.jpg" 
                      alt="Print Design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff;">Print Design</div>';
                      }}
                    />
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 1rem',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: '400',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        Print Design
                      </div>
                      
                      <div style={{
                        marginLeft: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg
                          width={isMobile ? "16" : "18"}
                          height={isMobile ? "16" : "18"}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M7 17L17 7M17 7H7M17 7V17" 
                            stroke="black" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>

                  {/* Card 6 dengan Link */}
                  <a 
                    href="/web-design" 
                    style={{
                      textDecoration: 'none',
                      position: 'relative',
                      width: isMobile ? '180px' : '220px',
                      height: isMobile ? '250px' : '320px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'block'
                    }}
                  >
                    <img 
                      src="images/5.jpg" 
                      alt="Web Design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff;">Web Design</div>';
                      }}
                    />
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 1rem',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: '400',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        Web Design
                      </div>
                      
                      <div style={{
                        marginLeft: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg
                          width={isMobile ? "16" : "18"}
                          height={isMobile ? "16" : "18"}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M7 17L17 7M17 7H7M17 7V17" 
                            stroke="black" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Progress Bar dengan 3 Foto dan Komentar */}
              <div style={{
                width: '100%',
                padding: isMobile ? '1rem' : '2rem',
                marginTop: isMobile ? '3rem' : '4rem',
                marginBottom: isMobile ? '3rem' : '4rem',
                boxSizing: 'border-box',
                position: 'relative'
              }}>
                {/* Counter Foto di samping kiri */}
                <div 
                  style={{
                    position: 'absolute',
                    left: isMobile ? '2rem' : '3rem',
                    top: isMobile ? '2rem' : '3rem',
                    zIndex: 20,
                    color: 'white',
                    fontSize: isMobile ? '2.5rem' : '3.5rem',
                    fontWeight: '600',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.3rem'
                  }}
                >
                  <span 
                    ref={leftCounterRef}
                    style={{
                      display: 'inline-block',
                      opacity: 1
                    }}
                  >
                    {leftCounter}
                  </span>
                  <span style={{
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    fontWeight: '400',
                    opacity: 0.8,
                    margin: '0 0.2rem'
                  }}>
                    /
                  </span>
                  <span style={{
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    fontWeight: '400',
                    opacity: 0.8
                  }}>
                    {totalPhotos}
                  </span>
                </div>

                {/* Waktu Update */}
                <div style={{
                  position: 'absolute',
                  right: isMobile ? '2rem' : '3rem',
                  top: isMobile ? '2rem' : '3rem',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontWeight: '500',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {photoTimeAgo[currentPhotoIndex]}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '1.5rem' : '2rem',
                  alignItems: 'center',
                  maxWidth: '800px',
                  margin: '0 auto'
                }}>
                  {/* Container Progress Bar */}
                  <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.5rem' : '0.8rem',
                    marginBottom: '1rem'
                  }}>
                    {progressPhotos.map((_, index) => (
                      <div 
                        key={index}
                        style={{
                          flex: 1,
                          height: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <div
                          className="progress-fill"
                          data-index={index}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            width: index === currentPhotoIndex ? '100%' : (index < currentPhotoIndex ? '100%' : '0%')
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Foto Portrait - KLIK UNTUK MEMBUKA FULL PAGE */}
                  <motion.div
                    onClick={handlePhotoClick}
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '600px',
                      height: isMobile ? '600px' : '800px',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer',
                      margin: '0 auto'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Foto Aktif */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPhotoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        <img 
                          src={progressPhotos[currentPhotoIndex].src}
                          alt={progressPhotos[currentPhotoIndex].alt}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.backgroundColor = '#222';
                            e.currentTarget.style.display = 'flex';
                            e.currentTarget.style.alignItems = 'center';
                            e.currentTarget.style.justifyContent = 'center';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.innerHTML = `<div style="padding: 2rem; text-align: center;">Photo ${currentPhotoIndex + 1}</div>`;
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Foto Card Design Section - 4 Card Pojok Kanan */}
              <div style={{
                width: '100%',
                padding: isMobile ? '1rem' : '2rem',
                marginTop: isMobile ? '2rem' : '4rem',
                marginBottom: isMobile ? '3rem' : '5rem',
                boxSizing: 'border-box',
                position: 'relative'
              }}>
                {/* Judul di Atas Foto - Tanpa Background Putih */}
                <div style={{
                  marginBottom: isMobile ? '2rem' : '3rem',
                  paddingLeft: isMobile ? '0' : '0'
                }}>
                  <div style={{
                    color: 'white',
                    fontSize: isMobile ? '2rem' : '3rem',
                    fontWeight: '700',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '1px',
                    textAlign: 'left'
                  }}>
                    Design Collection
                  </div>
                </div>

                {/* 4 Card Foto Pojok Kanan - Lebar dan Tinggi Besar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-start',
                  gap: isMobile ? '1rem' : '2rem',
                  flexWrap: 'wrap',
                  marginLeft: 'auto',
                  width: isMobile ? '100%' : '85%'
                }}>
                  
                  {/* Card 1 */}
                  <div style={{
                    position: 'relative',
                    width: isMobile ? 'calc(50% - 0.5rem)' : '350px',
                    height: isMobile ? '400px' : '550px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img 
                      src="images/5.jpg" 
                      alt="Visual Design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff; font-size: 1.5rem;">Visual Design</div>';
                      }}
                    />
                    
                    {/* Overlay Konten di Dalam Foto */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
                      color: 'white'
                    }}>
                      {/* Judul dan Toggle Icon dalam satu baris */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          fontSize: isMobile ? '1.3rem' : '1.8rem',
                          fontWeight: '600',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          Visual Design
                        </div>
                        
                        {/* Toggle Icon di pojok kanan */}
                        <div 
                          id="toggle1"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            color: 'white',
                            opacity: '0.8',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {/* Toggle Icon: Hamburger atau plus */}
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Deskripsi singkat */}
                      <div style={{
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        opacity: '0.9',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        lineHeight: '1.5'
                      }}>
                        Creating compelling visual experiences.
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div style={{
                    position: 'relative',
                    width: isMobile ? 'calc(50% - 0.5rem)' : '350px',
                    height: isMobile ? '400px' : '550px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img 
                      src="images/5.jpg" 
                      alt="Brand Identity"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff; font-size: 1.5rem;">Brand Identity</div>';
                      }}
                    />
                    
                    {/* Overlay Konten di Dalam Foto */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
                      color: 'white'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          fontSize: isMobile ? '1.3rem' : '1.8rem',
                          fontWeight: '600',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          Brand Identity
                        </div>
                        
                        {/* Toggle Icon di pojok kanan */}
                        <div 
                          id="toggle2"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            color: 'white',
                            opacity: '0.8',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Deskripsi singkat */}
                      <div style={{
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        opacity: '0.9',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        lineHeight: '1.5'
                      }}>
                        Building memorable brand systems.
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div style={{
                    position: 'relative',
                    width: isMobile ? 'calc(50% - 0.5rem)' : '350px',
                    height: isMobile ? '400px' : '550px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img 
                      src="images/5.jpg" 
                      alt="UI/UX Design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff; font-size: 1.5rem;">UI/UX Design</div>';
                      }}
                    />
                    
                    {/* Overlay Konten di Dalam Foto */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
                      color: 'white'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          fontSize: isMobile ? '1.3rem' : '1.8rem',
                          fontWeight: '600',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          UI/UX Design
                        </div>
                        
                        {/* Toggle Icon di pojok kanan */}
                        <div 
                          id="toggle3"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            color: 'white',
                            opacity: '0.8',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Deskripsi singkat */}
                      <div style={{
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        opacity: '0.9',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        lineHeight: '1.5'
                      }}>
                        Designing intuitive digital experiences.
                      </div>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div style={{
                    position: 'relative',
                    width: isMobile ? 'calc(50% - 0.5rem)' : '350px',
                    height: isMobile ? '400px' : '550px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img 
                      src="images/5.jpg" 
                      alt="Motion Graphics"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.backgroundColor = '#111';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center; color: #fff; font-size: 1.5rem;">Motion Graphics</div>';
                      }}
                    />
                    
                    {/* Overlay Konten di Dalam Foto */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
                      color: 'white'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          fontSize: isMobile ? '1.3rem' : '1.8rem',
                          fontWeight: '600',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          Motion Graphics
                        </div>
                        
                        {/* Toggle Icon di pojok kanan */}
                        <div 
                          id="toggle4"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            color: 'white',
                            opacity: '0.8',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Deskripsi singkat */}
                      <div style={{
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        opacity: '0.9',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        lineHeight: '1.5'
                      }}>
                        Bringing designs to life with animation.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Halaman Kosong Warna Hitam */}
                <div 
                  id="modalOverlay"
                  style={{
                    display: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 1000,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onClick={(e) => {
                    if (e.target.id === 'modalOverlay') {
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                >
                  <div style={{
                    backgroundColor: '#000',
                    width: '90%',
                    height: '90%',
                    borderRadius: '12px',
                    position: 'relative'
                  }}>
                    {/* Close Button */}
                    <button
                      onClick={() => {
                        document.getElementById('modalOverlay').style.display = 'none';
                      }}
                      style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1001
                      }}
                    >
                      ×
                    </button>
                    
                    {/* Konten Modal Kosong */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      height: '100%',
                      color: '#666',
                      fontSize: '1.2rem',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      Halaman Detail - Klik di luar modal atau tombol X untuk menutup
                    </div>
                  </div>
                </div>

                {/* JavaScript untuk menangani toggle */}
                <script dangerouslySetInnerHTML={{
                  __html: `
                    function setupModalToggle() {
                      // Tambahkan event listener ke semua toggle
                      for (let i = 1; i <= 4; i++) {
                        const toggle = document.getElementById('toggle' + i);
                        if (toggle) {
                          toggle.addEventListener('click', function(e) {
                            e.stopPropagation();
                            document.getElementById('modalOverlay').style.display = 'flex';
                          });
                        }
                      }
                    }
                    
                    // Jalankan setelah halaman dimuat
                    if (document.readyState === 'loading') {
                      document.addEventListener('DOMContentLoaded', setupModalToggle);
                    } else {
                      setupModalToggle();
                    }
                  `
                }} />
              </div>

              {/* Content tambahan */}
              <div style={{
                height: '50vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: isMobile ? '3rem' : '5rem',
                zIndex: 10,
                position: 'relative'
              }}>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    color: 'white',
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    fontWeight: '300',
                    textAlign: 'center',
                    maxWidth: '600px',
                    padding: '0 2rem'
                  }}
                >
                  More content coming soon...
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Halaman Index */}
          {currentView === "index" && (
            <motion.div
              key="index-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                minHeight: '100vh',
                padding: isMobile ? '1rem' : '2rem',
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              {/* Garis bawah di atas MENURU */}
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                marginBottom: '3rem'
              }}></div>

              {/* Container utama untuk halaman Index */}
              <div ref={topicContainerRef} style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '2rem' : '3rem',
                width: '100%',
                fontFamily: 'Helvetica, Arial, sans-serif',
                position: 'relative'
              }}>
                <div style={{
                  flex: 0.8,
                  marginLeft: isMobile ? '0.5rem' : '1rem'
                }}>
                  <div style={{
                    color: 'white',
                    fontSize: isMobile ? '1.8rem' : '2.5rem',
                    fontWeight: '300',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: 1
                  }}>
                    MENURU
                  </div>
                </div>

                <div style={{
                  flex: 1.2,
                  position: 'relative',
                  minHeight: isMobile ? '400px' : '600px',
                  marginLeft: isMobile ? '-3rem' : '-4rem'
                }}>
                  <AnimatePresence>
                    {hoveredTopic !== null && (
                      <motion.div
                        key="hovered-image"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          y: imagePosition
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '85%',
                          height: '85%',
                          zIndex: 5
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                          style={{
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: '15px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <img 
                            src="images/5.jpg" 
                            alt={`Topic ${hoveredTopic}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'block',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.backgroundColor = '#333';
                              e.currentTarget.style.display = 'flex';
                              e.currentTarget.style.alignItems = 'center';
                              e.currentTarget.style.justifyContent = 'center';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Topic Image</div>';
                            }}
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div style={{
                  flex: 1,
                  position: 'relative',
                  marginLeft: isMobile ? '-4rem' : '-5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    {indexTopics.map((topic, index) => (
                      <div 
                        key={topic.id}
                        onMouseEnter={() => handleTopicHover(topic.id)}
                        onMouseLeave={() => handleTopicHover(null)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          padding: isMobile ? '0.8rem 0' : '1rem 0',
                          cursor: 'pointer'
                        }}
                      >
                        <AnimatePresence>
                          {hoveredTopic === topic.id && (
                            <motion.div
                              initial={{ width: 0, opacity: 0 }}
                              animate={{ width: '100%', opacity: 1 }}
                              exit={{ width: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                height: '1px',
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                transform: 'translateY(-50%)',
                                zIndex: 1
                              }}
                            />
                          )}
                        </AnimatePresence>

                        <motion.div
                          style={{
                            color: 'white',
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            fontWeight: hoveredTopic === topic.id ? '600' : '400',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            lineHeight: 1.1,
                            position: 'relative',
                            zIndex: 2,
                            transition: 'font-weight 0.2s ease'
                          }}
                          whileHover={{ x: 5 }}
                        >
                          {topic.title}
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  flex: 1,
                  marginLeft: isMobile ? '-5rem' : '-6rem'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    {indexTopics.map((topic, index) => (
                      <div 
                        key={topic.id}
                        onMouseEnter={() => handleTopicHover(topic.id)}
                        onMouseLeave={() => handleTopicHover(null)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: isMobile ? '0.8rem 0' : '1rem 0',
                          cursor: 'pointer',
                          position: 'relative',
                          zIndex: 10
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '0.5rem'
                        }}>
                          <motion.div
                            style={{
                              color: 'white',
                              fontSize: isMobile ? '1.2rem' : '1.5rem',
                              fontWeight: hoveredTopic === topic.id ? '600' : '400',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              lineHeight: 1.1,
                              transition: 'font-weight 0.2s ease',
                              position: 'relative',
                              zIndex: 11
                            }}
                            whileHover={{ x: 5 }}
                          >
                            {topic.description}
                          </motion.div>
                          <div style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            fontWeight: '400',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            lineHeight: 1.1,
                            whiteSpace: 'nowrap',
                            position: 'relative',
                            zIndex: 11
                          }}>
                            {topic.year}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Container untuk Tombol Slider */}
              <div style={{
                position: 'relative',
                marginTop: '4rem',
                marginBottom: '4rem',
                paddingLeft: isMobile ? '1rem' : '2rem',
                paddingRight: isMobile ? '1rem' : '2rem',
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <motion.button
                    onClick={toggleSlider}
                    style={{
                      width: '120px',
                      height: '50px',
                      backgroundColor: '#0050B7',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 15px',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: 1
                      }}>
                        INDEX
                      </span>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: 0.5
                      }}>
                        GRID
                      </span>
                    </div>
                    
                    <motion.div
                      animate={{ x: 15 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{
                        width: '35px',
                        height: '35px',
                        backgroundColor: '#00FF00',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: '7px',
                        boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)'
                      }}
                    />
                  </motion.button>

                  <div style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Index View
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Halaman Grid (placeholder) */}
          {currentView === "grid" && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                minHeight: '100vh',
                padding: isMobile ? '1rem' : '2rem',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <h2 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: '300',
                marginBottom: '2rem'
              }}>
                Grid View - Coming Soon
              </h2>
              
              <div style={{
                marginTop: '3rem',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <motion.button
                    onClick={toggleSlider}
                    style={{
                      width: '120px',
                      height: '50px',
                      backgroundColor: '#0050B7',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 15px',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: 0.5
                      }}>
                        INDEX
                      </span>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: 1
                      }}>
                        GRID
                      </span>
                    </div>
                    
                    <motion.div
                      animate={{ x: 65 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{
                        width: '35px',
                        height: '35px',
                        backgroundColor: '#00FF00',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: '7px',
                        boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)'
                      }}
                    />
                  </motion.button>

                  <div style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Grid View
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cookie Notification */}
      <AnimatePresence>
        {showCookieNotification && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? '90%' : '700px',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              zIndex: 1000,
              overflow: 'hidden',
              display: 'flex',
              border: '2px solid rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              flex: 1,
              padding: isMobile ? '1.2rem' : '1.8rem',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.8rem' : '1.2rem'
            }}>
              <div style={{
                width: isMobile ? '40px' : '50px',
                height: isMobile ? '40px' : '50px',
                backgroundColor: '#FBBF24',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg 
                  width={isMobile ? "20" : "25"} 
                  height={isMobile ? "20" : "25"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#92400E"
                  strokeWidth="2"
                >
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                  <path d="M8.5 8.5v.01"/>
                  <path d="M16 15.5v.01"/>
                  <path d="M12 12v.01"/>
                  <path d="M11 17v.01"/>
                  <path d="M7 14v.01"/>
                </svg>
              </div>
              
              <div style={{
                flex: 1
              }}>
                <p style={{
                  margin: 0,
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  color: 'black',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  lineHeight: 1.5
                }}>
                  Kami menggunakan cookie untuk meningkatkan pengalaman Anda di website ini. 
                  Cookie membantu kami mengingat preferensi Anda dan membuat website berfungsi lebih baik.
                </p>
              </div>
            </div>

            <button
              onClick={handleAcceptCookies}
              style={{
                width: isMobile ? '80px' : '100px',
                backgroundColor: 'black',
                color: 'white',
                border: 'none',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS Animation untuk rotate effect */}
      <style jsx global>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes searchPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 255, 0, 0);
          }
          100% {
            boxShadow: 0 0 0 0 rgba(0, 255, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}





