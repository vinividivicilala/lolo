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
  signInWithPopup,
  updateProfile,
  updateEmail,
  deleteUser
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
  writeBatch,
  where,
  deleteDoc,
  getDocs
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

// Type untuk notifikasi
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
  isAdminPost?: boolean;
  adminName?: string;
  category?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isPinned: boolean;
  category?: string;
  link?: string;
  tags?: string[];
  color?: string;
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

  // State untuk notifikasi dan search
  const [showNotification, setShowNotification] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // State untuk modal profil user
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [totalNotesCount, setTotalNotesCount] = useState(0);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'settings' | 'help' | 'feedback'>('notes');
  const [userProvider, setUserProvider] = useState<string>('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State untuk GSAP Loading
  const [showGsapLoading, setShowGsapLoading] = useState(true);

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
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk notifikasi dan search
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userProfileModalRef = useRef<HTMLDivElement>(null);

  // Ref untuk GSAP Loading
  const gsapLoadingRef = useRef<HTMLDivElement>(null);

  // Data untuk pencarian
  const searchablePages = [
    {
      id: 1,
      title: "Chatbot AI",
      description: "AI Assistant dengan teknologi terbaru",
      category: "Tools",
      url: "/chatbot",
      icon: "🤖"
    },
    {
      id: 2,
      title: "Sign In",
      description: "Masuk ke akun Anda",
      category: "Authentication",
      url: "/signin",
      icon: "🔐"
    },
    {
      id: 3,
      title: "Sign Up",
      description: "Buat akun baru",
      category: "Authentication",
      url: "/signup",
      icon: "👤"
    },
    {
      id: 4,
      title: "Notifikasi",
      description: "Lihat semua notifikasi",
      category: "System",
      url: "/notifications",
      icon: "🔔"
    },
    {
      id: 5,
      title: "Dokumentasi",
      description: "Baca dokumentasi lengkap",
      category: "Resources",
      url: "/docs",
      icon: "📚"
    },
    {
      id: 6,
      title: "Update",
      description: "Pembaruan terbaru",
      category: "News",
      url: "/update",
      icon: "🆕"
    },
    {
      id: 7,
      title: "Timeline",
      description: "Linimasa aktivitas",
      category: "Features",
      url: "/timeline",
      icon: "📅"
    },
    {
      id: 8,
      title: "Catatan",
      description: "Catatan pribadi Anda",
      category: "Personal",
      url: "/notes",
      icon: "📝"
    }
  ];

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

  // Helper functions
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
    return color + '20';
  };

  const calculateTimeAgo = (date: Date | Timestamp | undefined | null): string => {
    try {
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
        commentDate = new Date(date);
      }
      
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
      } else if (diffInSeconds < 2592000) {
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

  // Fungsi untuk melakukan pencarian
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    
    const results = searchablePages.filter(page => 
      page.title.toLowerCase().includes(lowerQuery) ||
      page.description.toLowerCase().includes(lowerQuery) ||
      page.category.toLowerCase().includes(lowerQuery)
    );

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
    
    if (results.length > 0 && searchContainerRef.current) {
      gsap.fromTo(".search-result-item", 
        { opacity: 0, y: -10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.1,
          ease: "power2.out" 
        }
      );
    }
  };

  // Update handler untuk search query
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
  };

  // Handler untuk klik pada hasil pencarian
  const handleSearchResultClick = (url: string) => {
    router.push(url);
    setShowSearch(false);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Handler untuk key press di search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (searchResults.length > 0) {
        handleSearchResultClick(searchResults[0].url);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        setShowSearch(false);
        setSearchQuery("");
      }
    } else if (e.key === 'Escape') {
      setShowSearch(false);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  // Handler untuk toggle search
  const handleSearchToggle = () => {
    const newShowSearch = !showSearch;
    setShowSearch(newShowSearch);
    
    if (newShowSearch) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Fungsi untuk mengirim notifikasi
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
      
      setTimeout(() => {
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

  // Fungsi untuk mark notification as read
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
      
      await updateDoc(notificationRef, {
        [`userReads.${userIdToUse}`]: true,
        views: increment(1)
      });
      
      console.log(`✅ Marked notification ${notificationId} as read for user ${userIdToUse}`);
      
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
      
      setNotificationCount(prev => Math.max(0, prev - 1));
      setHasUnreadNotifications(prev => {
        const newCount = notificationCount - 1;
        return newCount > 0;
      });
      
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  // Handler untuk klik notifikasi
  const handleNotificationClick = async (notification: Notification) => {
    if (notification.id && !notification.isRead) {
      await markAsRead(notification.id);
    }
    
    console.log("Notification clicked:", notification);
    
    setShowNotification(false);
  };

  // Fungsi untuk clear all notifications
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
      
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(notification => {
        return !notification.userReads?.[userIdToUse];
      });
      
      console.log(`🗑️ Clearing ${unreadNotifications.length} unread notifications`);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, {
          [`userReads.${userIdToUse}`]: true,
          views: increment(1)
        });
      });
      
      await batch.commit();
      
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
        await updateDoc(userStatsRef, {
          loginCount: increment(1),
          lastLogin: serverTimestamp(),
          userName: userName,
          updatedAt: serverTimestamp()
        });
        
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
        await setDoc(userStatsRef, {
          userId: userId,
          userName: userName,
          loginCount: 1,
          totalLogins: 1,
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

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

  // Fungsi untuk load user notes dari Firebase - DIPERBAIKI
  const loadUserNotes = async (userId: string) => {
    if (!db || !userId) return;
    
    try {
      setIsLoadingNotes(true);
      console.log(`📝 Loading notes for user: ${userId} from userNotes collection`);
      
      // Gunakan collection 'userNotes' yang sama dengan halaman notes
      const notesRef = collection(db, 'userNotes');
      const q = query(
        notesRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notesData: Note[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // DEBUG: Tampilkan data yang diterima
        console.log("Firestore note data:", {
          id: doc.id,
          data: data,
          hasCategory: !!data.category,
          hasLink: !!data.link,
          hasDescription: !!data.description,
          hasContent: !!data.content
        });
        
        // Ambil field sesuai dengan struktur di halaman notes
        const noteTitle = data.title?.trim() || 'Untitled Note';
        const noteDescription = data.description?.trim() || data.content?.trim() || '';
        const noteCategory = data.category?.trim() || '';
        const noteLink = data.link?.trim() || '';
        
        notesData.push({
          id: doc.id,
          title: noteTitle,
          content: noteDescription, // Gunakan description sebagai content
          userId: data.userId || userId,
          userName: data.userName || userDisplayName || 'User',
          userEmail: data.userEmail || user?.email || '',
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
          isPinned: data.isPinned || false,
          category: noteCategory, // Tambahkan category
          link: noteLink, // Tambahkan link
          color: data.color || '#3B82F6',
          tags: data.tags || []
        });
      });
      
      console.log(`✅ Loaded ${notesData.length} notes for user ${userId}`);
      console.log("Sample note data:", notesData[0]); // Debug: tampilkan contoh data
      
      setUserNotes(notesData);
      setTotalNotesCount(notesData.length);
      setIsLoadingNotes(false);
    } catch (error) {
      console.error("Error loading user notes:", error);
      setIsLoadingNotes(false);
    }
  };

  // Fungsi untuk load user notes secara real-time - DIPERBAIKI
  const loadUserNotesRealtime = (userId: string) => {
    if (!db || !userId) return () => {};
    
    try {
      // Gunakan collection 'userNotes' yang sama
      const notesRef = collection(db, 'userNotes');
      const q = query(
        notesRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notesData: Note[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Ambil field sesuai dengan struktur di halaman notes
          const noteTitle = data.title?.trim() || 'Untitled Note';
          const noteDescription = data.description?.trim() || data.content?.trim() || '';
          const noteCategory = data.category?.trim() || '';
          const noteLink = data.link?.trim() || '';
          
          notesData.push({
            id: doc.id,
            title: noteTitle,
            content: noteDescription, // Gunakan description sebagai content
            userId: data.userId || userId,
            userName: data.userName || userDisplayName || 'User',
            userEmail: data.userEmail || user?.email || '',
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date(),
            isPinned: data.isPinned || false,
            category: noteCategory, // Tambahkan category
            link: noteLink, // Tambahkan link
            color: data.color || '#3B82F6',
            tags: data.tags || []
          });
        });
        
        console.log(`🔄 Realtime update: ${notesData.length} notes from userNotes`);
        setUserNotes(notesData);
        setTotalNotesCount(notesData.length);
      }, (error) => {
        console.error("Error in realtime notes listener:", error);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up realtime notes:", error);
      return () => {};
    }
  };

  // Fungsi untuk detect provider
  const detectProvider = (user: any) => {
    if (!user) return 'Unknown';
    
    const providerData = user.providerData;
    if (providerData && providerData.length > 0) {
      const providerId = providerData[0].providerId;
      switch (providerId) {
        case 'password':
          return 'Email/Password';
        case 'google.com':
          return 'Google';
        case 'github.com':
          return 'GitHub';
        default:
          return providerId;
      }
    }
    return 'Email/Password';
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || 
                     currentUser.email?.split('@')[0] || 
                     'User';
        setUserDisplayName(name);
        setEditName(name);
        setEditEmail(currentUser.email || '');
        
        setUserProvider(detectProvider(currentUser));
        
        await updateUserStats(currentUser.uid, name);
        
        try {
          const userStatsRef = doc(db, 'userStats', currentUser.uid);
          const userStatsDoc = await getDoc(userStatsRef);
          
          if (userStatsDoc.exists()) {
            setUserStats(userStatsDoc.data() as UserStats);
          }
        } catch (error) {
          console.error("Error loading user stats:", error);
        }
        
        if (showUserProfileModal) {
          await loadUserNotes(currentUser.uid);
        }
      } else {
        setUser(null);
        setUserDisplayName("");
        setUserStats(null);
        setShowUserDropdown(false);
        setShowUserProfileModal(false);
        setUserNotes([]);
        setTotalNotesCount(0);
      }
    });

    return () => unsubscribe();
  }, [showUserProfileModal]);

  // Real-time listener untuk notes ketika modal terbuka
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (showUserProfileModal && user) {
      unsubscribe = loadUserNotesRealtime(user.uid);
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [showUserProfileModal, user]);

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

  // Load notifications from Firebase
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
          
          const currentUser = auth?.currentUser;
          const currentUserId = currentUser ? currentUser.uid : 
                                localStorage.getItem('anonymous_user_id') || 
                                'anonymous_' + Date.now();
          
          if (!currentUser && !localStorage.getItem('anonymous_user_id')) {
            localStorage.setItem('anonymous_user_id', currentUserId);
          }
          
          querySnapshot.forEach((doc) => {
            try {
              const data = doc.data();
              
              if (data.isDeleted === true) {
                return;
              }
              
              let shouldShow = false;
              
              switch (data.recipientType) {
                case 'all':
                  shouldShow = true;
                  break;
                  
                case 'specific':
                  const recipientIds = data.recipientIds || [];
                  if (recipientIds.includes(currentUserId) || 
                      (currentUser && recipientIds.includes(currentUser.uid))) {
                    shouldShow = true;
                  }
                  break;
                  
                case 'email_only':
                  if (currentUser && data.recipientEmails?.includes(currentUser.email)) {
                    shouldShow = true;
                  }
                  break;
                  
                case 'app_only':
                  if (currentUser) {
                    shouldShow = true;
                  }
                  break;
                  
                default:
                  shouldShow = false;
              }
              
              if (shouldShow) {
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
                  isRead: false,
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
                  read: data.read || false,
                  isAdminPost: data.isAdminPost || false,
                  adminName: data.adminName || '',
                  category: data.category || 'general'
                };
                
                const isReadByUser = notification.userReads[currentUserId] || 
                                    (currentUser && notification.userReads[currentUser.uid]) || 
                                    false;
                
                if (!isReadByUser) {
                  unreadCount++;
                }
                
                notificationsData.push(notification);
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
          
          setIsLoadingNotifications(false);
        }
      );
      
      return () => unsubscribe();
    } catch (error) {
      console.error("❌ Error in notifications useEffect:", error);
      setIsLoadingNotifications(false);
    }
  }, [db, auth?.currentUser]);

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

  // Mouse wheel scroll handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Biarkan scroll normal jika tidak dalam modal
      if (!showUserProfileModal && !showMenuruFullPage && !showPhotoFullPage) {
        return;
      }
      
      // Jika dalam modal, izinkan scroll dengan mouse wheel
      e.stopPropagation();
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Middle click (scroll wheel click) untuk scroll
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [showUserProfileModal, showMenuruFullPage, showPhotoFullPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
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
      if (userProfileModalRef.current && !userProfileModalRef.current.contains(event.target as Node)) {
        setShowUserProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fungsi untuk mengupdate counter angka kiri
  const updateLeftCounter = (newIndex: number) => {
    const newLeftCounter = String(newIndex + 1).padStart(2, '0');
    
    if (leftCounterRef.current) {
      gsap.to(leftCounterRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        onComplete: () => {
          setLeftCounter(newLeftCounter);
          
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

  // Handler untuk membuka menu overlay
  const handleOpenMenu = () => {
    setShowMenuOverlay(true);
  };

  // Handler untuk menutup menu overlay
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

  // Animasi GSAP Loading
  useEffect(() => {
    if (!gsapLoadingRef.current) return;

    const loadingTimeline = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          gsap.to(gsapLoadingRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              setShowGsapLoading(false);
            }
          });
        }, 300);
      }
    });

    // Animasi masuk dari bawah
    loadingTimeline.fromTo(gsapLoadingRef.current,
      {
        y: 100,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out"
      }
    );

    // Animasi scale
    loadingTimeline.to(gsapLoadingRef.current, {
      scale: 1.1,
      duration: 0.8,
      ease: "power2.inOut"
    }, "-=0.3");

    loadingTimeline.to(gsapLoadingRef.current, {
      scale: 1,
      duration: 0.8,
      ease: "power2.inOut"
    });

    return () => {
      loadingTimeline.kill();
    };
  }, []);

  useEffect(() => {
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
        if (showMenuOverlay) {
          handleCloseMenu();
        }
        if (showNotification) {
          setShowNotification(false);
        }
        if (showSearch) {
          setShowSearch(false);
        }
        if (showUserProfileModal) {
          setShowUserProfileModal(false);
        }
        if (showDeleteAccountModal) {
          setShowDeleteAccountModal(false);
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
  }, [isMobile, showMenuruFullPage, showPhotoFullPage, showUserDropdown, showLogoutModal, showMenuOverlay, showNotification, showSearch, showUserProfileModal, showDeleteAccountModal]);

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

  // Handler untuk Sign In / User Button - DIPERBAIKI
  const handleSignInClick = () => {
    if (user) {
      setShowUserProfileModal(true);
      // Load notes ketika modal dibuka
      if (user) {
        loadUserNotes(user.uid);
      }
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
      setShowUserProfileModal(true);
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
      setShowUserProfileModal(true);
    } catch (error) {
      console.error("Google login error:", error);
      alert("Login dengan Google gagal. Silakan coba lagi.");
    }
  };

  // Handler untuk menuju halaman catatan
  const handleNotesClick = () => {
    setShowUserDropdown(false);
    setShowUserProfileModal(false);
    router.push('/notes');
  };

  // Handler untuk logout
  const handleLogoutClick = () => {
    setShowUserProfileModal(false);
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
      setShowUserProfileModal(false);
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

  // Handler untuk search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  // Handler untuk update profile
  const handleUpdateProfile = async () => {
    if (!user || !auth.currentUser) return;
    
    try {
      setIsUpdating(true);
      
      if (editName !== userDisplayName) {
        await updateProfile(auth.currentUser, {
          displayName: editName
        });
        setUserDisplayName(editName);
      }
      
      if (editEmail !== user.email && editEmail.trim() !== '') {
        await updateEmail(auth.currentUser, editEmail);
      }
      
      const userStatsRef = doc(db, 'userStats', user.uid);
      await updateDoc(userStatsRef, {
        userName: editName,
        updatedAt: serverTimestamp()
      });
      
      alert("Profil berhasil diperbarui!");
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(`Gagal memperbarui profil: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler untuk hapus akun
  const handleDeleteAccount = async () => {
    if (!user || !auth.currentUser) return;
    
    try {
      // Hapus semua notes user
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Hapus user stats
      const userStatsRef = doc(db, 'userStats', user.uid);
      batch.delete(userStatsRef);
      
      await batch.commit();
      
      // Hapus user dari authentication
      await deleteUser(auth.currentUser);
      
      alert("Akun berhasil dihapus!");
      setShowDeleteAccountModal(false);
      setShowUserProfileModal(false);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(`Gagal menghapus akun: ${error.message}`);
    }
  };

  // Handler untuk kirim feedback
  const handleSendFeedback = () => {
    const feedback = prompt("Masukkan feedback Anda:");
    if (feedback && feedback.trim() !== '') {
      alert("Terima kasih atas feedback Anda!");
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

      {/* GSAP Modern Loading Animation */}
      <AnimatePresence>
        {showGsapLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              cursor: 'default'
            }}
          >
            <div
              ref={gsapLoadingRef}
              style={{
                color: 'white',
                fontSize: isMobile ? '3.5rem' : '5rem',
                fontWeight: 300,
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '6px',
                textTransform: 'uppercase',
                opacity: 0,
                textAlign: 'center',
                lineHeight: 1,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              Menuru
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Profil User - DIPERBAIKI */}
      <AnimatePresence>
        {showUserProfileModal && user && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.98)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowUserProfileModal(false)}
          >
            <motion.div
              ref={userProfileModalRef}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: 'transparent',
                borderRadius: '0',
                width: '95%',
                maxWidth: '1200px',
                height: '90vh',
                maxHeight: '800px',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                border: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sidebar Tabs di Kiri - TRANSPARAN */}
              <div style={{
                width: '300px',
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem 0',
                flexShrink: 0
              }}>
                <div style={{
                  padding: '0 2rem',
                  marginBottom: '3rem'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: '300',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    margin: 0,
                    letterSpacing: '1px'
                  }}>
                    {userDisplayName}
                  </h3>
                  <p style={{
                    color: 'white',
                    fontSize: '1rem',
                    margin: '0.5rem 0 0 0',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    opacity: 0.8
                  }}>
                    {user.email}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {['notes', 'settings', 'help', 'feedback'].map((tab) => (
                    <motion.button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab as any);
                        if (tab === 'notes' && user) {
                          loadUserNotes(user.uid);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '1.5rem 2rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: activeTab === tab ? 'white' : 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1.3rem',
                        fontWeight: '300',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                    >
                      <span>
                        {tab === 'notes' ? 'Notes' :
                         tab === 'settings' ? 'Settings' :
                         tab === 'help' ? 'Help' :
                         'Feedback'}
                      </span>
                      {activeTab === tab && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <path d="M6 18L18 6"/>
                            <path d="M8 6h10v10"/>
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div style={{
                  marginTop: 'auto',
                  padding: '2rem'
                }}>
                  <motion.button
                    onClick={handleLogoutClick}
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '0',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '300',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      cursor: 'pointer',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.8rem'
                    }}
                  >
                    Logout
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <path d="M16 17l5-5-5-5"/>
                      <path d="M21 12H9"/>
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Content Area di Kanan - TRANSPARAN */}
              <div style={{
                flex: 1,
                padding: '3rem',
                overflowY: 'auto',
                backgroundColor: 'transparent'
              }}>
                {/* Close Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '2rem'
                }}>
                  <motion.button
                    onClick={() => setShowUserProfileModal(false)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      opacity: 0.7
                    }}
                  >
                    ×
                  </motion.button>
                </div>

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '3rem'
                    }}>
                      <h4 style={{
                        color: 'white',
                        fontSize: '3rem',
                        fontWeight: '300',
                        margin: 0,
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        letterSpacing: '0.5px'
                      }}>
                        Notes
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <motion.button
                          onClick={() => router.push('/notes')}
                          style={{
                            padding: '0.8rem 1.5rem',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '0',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '300',
                            cursor: 'pointer',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          Go to Notes
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 17l9.2-9.2M17 17V7H7"/>
                          </svg>
                        </motion.button>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.9rem'
                        }}>
                          Total: {totalNotesCount}
                        </div>
                      </div>
                    </div>

                    {isLoadingNotes ? (
                      <div style={{
                        padding: '4rem 0',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: 'Helvetica, Arial, sans-serif'
                      }}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{ marginBottom: '1rem' }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                        </motion.div>
                        Loading notes...
                      </div>
                    ) : !userNotes || userNotes.length === 0 ? (
                      <div style={{
                        padding: '6rem 0',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: 'Helvetica, Arial, sans-serif'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.5 }}>
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                        </div>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '1.2rem' }}>No notes yet</p>
                        <motion.button
                          onClick={() => router.push('/notes')}
                          style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '1.2rem 2.5rem',
                            borderRadius: '0',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            margin: '0 auto'
                          }}
                        >
                          Create first note
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 17l9.2-9.2M17 17V7H7"/>
                          </svg>
                        </motion.button>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4rem'
                      }}>
                        {Array.isArray(userNotes) && userNotes.map((note) => {
                          if (!note || !note.id) return null;
                          
                          const getVideoEmbedUrl = (link: string | undefined) => {
                            if (!link || typeof link !== 'string' || link.trim() === '') return null;
                            
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

                          const getVideoThumbnail = (link: string | undefined) => {
                            if (!link || typeof link !== 'string' || link.trim() === '') return null;
                            
                            try {
                              const url = new URL(link);
                              
                              if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
                                const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                                if (videoId) {
                                  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                }
                              }
                              
                              return null;
                            } catch {
                              return null;
                            }
                          };

                          const videoEmbedUrl = note.link ? getVideoEmbedUrl(note.link) : null;
                          const videoThumbnail = note.link ? getVideoThumbnail(note.link) : null;
                          const hasValidCategory = note.category && typeof note.category === 'string' && note.category.trim() !== '';
                          const hasValidContent = note.content && typeof note.content === 'string' && note.content.trim() !== '';
                          const hasValidLink = note.link && typeof note.link === 'string' && note.link.trim() !== '';

                          return (
                            <motion.div
                              key={note.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                              }}
                              onClick={() => router.push('/notes')}
                            >
                              {hasValidCategory && (
                                <div style={{
                                  fontSize: '1.2rem',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '0.5rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  {note.category.trim()}
                                </div>
                              )}

                              <div style={{
                                fontSize: '2.5rem',
                                fontFamily: 'Helvetica, Arial, sans-serif',
                                lineHeight: '1.3',
                                color: 'white',
                                fontWeight: '400'
                              }}>
                                {note.title || 'Untitled Note'}
                              </div>

                              {hasValidContent && (
                                <div style={{
                                  fontSize: '1.3rem',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                  lineHeight: '1.6',
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  marginTop: '1rem',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {note.content}
                                </div>
                              )}

                              {hasValidLink && videoEmbedUrl && (
                                <div style={{
                                  margin: '1.5rem 0',
                                  position: 'relative'
                                }}>
                                  {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com') ? (
                                    <div style={{
                                      position: 'relative',
                                      paddingBottom: '56.25%',
                                      height: 0,
                                      overflow: 'hidden',
                                      backgroundColor: '#000',
                                      borderRadius: '4px'
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
                                        title="Video embed"
                                      />
                                    </div>
                                  ) : videoEmbedUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i) ? (
                                    <div style={{
                                      position: 'relative',
                                      backgroundColor: '#000',
                                      borderRadius: '4px',
                                      overflow: 'hidden',
                                      maxWidth: '560px'
                                    }}>
                                      <video
                                        src={videoEmbedUrl}
                                        style={{
                                          width: '100%',
                                          height: 'auto',
                                          aspectRatio: '16/9',
                                          backgroundColor: '#000'
                                        }}
                                        controls
                                        poster={videoThumbnail || undefined}
                                      />
                                    </div>
                                  ) : (
                                    <div style={{
                                      padding: '1rem',
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}>
                                      <a
                                        href={note.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          color: 'white',
                                          textDecoration: 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          fontSize: '1rem',
                                          fontFamily: 'Helvetica, Arial, sans-serif',
                                          wordBreak: 'break-all'
                                        }}
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h6"/>
                                          <polyline points="15 3 21 3 21 9"/>
                                          <line x1="10" y1="14" x2="21" y2="3"/>
                                        </svg>
                                        {note.link}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '1.5rem'
                              }}>
                                <span style={{
                                  fontSize: '1rem',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                  color: 'rgba(255, 255, 255, 0.5)'
                                }}>
                                  {note.updatedAt ? calculateTimeAgo(note.updatedAt) : 'Recently'}
                                </span>
                                
                                {hasValidLink && (
                                  <a
                                    href={note.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      color: 'white',
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      fontSize: '1rem',
                                      fontFamily: 'Helvetica, Arial, sans-serif'
                                    }}
                                  >
                                    Buka Link
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M7 17l9.2-9.2M17 17V7H7"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                        
                        {Array.isArray(userNotes) && userNotes.length > 0 && (
                          <motion.div
                            onClick={() => router.push('/notes')}
                            style={{
                              padding: '1.5rem 0',
                              textAlign: 'center',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                              marginTop: '1rem'
                            }}
                          >
                            <div style={{
                              color: 'white',
                              fontSize: '1.2rem',
                              fontWeight: '300',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}>
                              View all {userNotes.length} notes in Notes Page
                            </div>
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '0.9rem',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}>
                              Click to see all your notes with full features
                            </div>
                            <motion.svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              style={{ marginTop: '0.5rem' }}
                            >
                              <path d="M7 17l9.2-9.2M17 17V7H7"/>
                            </motion.svg>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h4 style={{
                      color: 'white',
                      fontSize: '3rem',
                      fontWeight: '300',
                      margin: '0 0 3rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      Settings
                    </h4>

                    {isEditingProfile ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2.5rem',
                        maxWidth: '600px'
                      }}>
                        <div>
                          <label style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1.1rem',
                            marginBottom: '1rem',
                            display: 'block',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px'
                          }}>
                            Display name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '1.2rem',
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '0',
                              color: 'white',
                              fontSize: '1.2rem',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1.1rem',
                            marginBottom: '1rem',
                            display: 'block',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px'
                          }}>
                            Email address
                          </label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '1.2rem',
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '0',
                              color: 'white',
                              fontSize: '1.2rem',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '1.5rem',
                          justifyContent: 'flex-end',
                          marginTop: '2rem'
                        }}>
                          <motion.button
                            onClick={() => setIsEditingProfile(false)}
                            style={{
                              padding: '1.2rem 2.5rem',
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '0',
                              color: 'white',
                              fontSize: '1.1rem',
                              fontWeight: '300',
                              cursor: 'pointer',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              letterSpacing: '0.5px'
                            }}
                            disabled={isUpdating}
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            onClick={handleUpdateProfile}
                            style={{
                              padding: '1.2rem 2.5rem',
                              backgroundColor: 'transparent',
                              border: '1px solid white',
                              borderRadius: '0',
                              color: 'white',
                              fontSize: '1.1rem',
                              fontWeight: '300',
                              cursor: 'pointer',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              letterSpacing: '0.5px'
                            }}
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Updating...' : 'Save'}
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2.5rem',
                        maxWidth: '700px'
                      }}>
                        <motion.div
                          style={{
                            padding: '2rem',
                            backgroundColor: 'transparent',
                            borderRadius: '0',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onClick={() => setIsEditingProfile(true)}
                        >
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            marginBottom: '0.8rem'
                          }}>
                            Display name
                          </div>
                          <div style={{
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            {userDisplayName}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18"/>
                              <path d="M8 6h10v10"/>
                            </svg>
                          </div>
                        </motion.div>

                        <motion.div
                          style={{
                            padding: '2rem',
                            backgroundColor: 'transparent',
                            borderRadius: '0',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onClick={() => setIsEditingProfile(true)}
                        >
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            marginBottom: '0.8rem'
                          }}>
                            Email address
                          </div>
                          <div style={{
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            {user.email}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18"/>
                              <path d="M8 6h10v10"/>
                            </svg>
                          </div>
                        </motion.div>

                        <div style={{
                          padding: '2rem',
                          backgroundColor: 'transparent',
                          borderRadius: '0',
                          border: 'none'
                        }}>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            marginBottom: '0.8rem'
                          }}>
                            Login method
                          </div>
                          <div style={{
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px'
                          }}>
                            {userProvider}
                          </div>
                        </div>

                        <div style={{
                          padding: '2rem',
                          backgroundColor: 'transparent',
                          borderRadius: '0',
                          border: 'none'
                        }}>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            marginBottom: '0.8rem'
                          }}>
                            User ID
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            wordBreak: 'break-all'
                          }}>
                            {user.uid}
                          </div>
                        </div>

                        <div style={{
                          marginTop: '1.5rem'
                        }}>
                          <motion.button
                            onClick={() => setShowDeleteAccountModal(true)}
                            style={{
                              width: '100%',
                              padding: '1.5rem',
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '0',
                              color: 'white',
                              fontSize: '1.2rem',
                              fontWeight: '300',
                              cursor: 'pointer',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              letterSpacing: '0.5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '1rem'
                            }}
                          >
                            Delete account
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Help Tab */}
                {activeTab === 'help' && (
                  <div>
                    <h4 style={{
                      color: 'white',
                      fontSize: '3rem',
                      fontWeight: '300',
                      margin: '0 0 3rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      Help
                    </h4>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2.5rem',
                      maxWidth: '800px'
                    }}>
                      <div
                        style={{
                          padding: '2.5rem',
                          backgroundColor: 'transparent',
                          borderRadius: '0',
                          border: 'none'
                        }}
                      >
                        <h5 style={{
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: '300',
                          margin: '0 0 1.5rem 0',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          Getting started
                        </h5>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          Welcome to MENURU. This platform helps you organize your creative journey. Start by creating notes, exploring features, and customizing your profile.
                        </p>
                      </div>

                      <div
                        style={{
                          padding: '2.5rem',
                          backgroundColor: 'transparent',
                          borderRadius: '0',
                          border: 'none'
                        }}
                      >
                        <h5 style={{
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: '300',
                          margin: '0 0 1.5rem 0',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          Features guide
                        </h5>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          • Notes: Create and organize your thoughts<br/>
                          • Settings: Customize your profile and preferences<br/>
                          • Chatbot: Get assistance with AI<br/>
                          • Timeline: Track your progress<br/>
                          • Notifications: Stay updated
                        </p>
                      </div>

                      <motion.button
                        onClick={() => router.push('/docs')}
                        style={{
                          padding: '1.5rem 3rem',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '0',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: '300',
                          cursor: 'pointer',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '1rem'
                        }}
                      >
                        <span>View full documentation</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18"/>
                          <path d="M8 6h10v10"/>
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                  <div>
                    <h4 style={{
                      color: 'white',
                      fontSize: '3rem',
                      fontWeight: '300',
                      margin: '0 0 3rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      Feedback
                    </h4>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2.5rem',
                      maxWidth: '800px'
                    }}>
                      <div
                        style={{
                          padding: '2.5rem',
                          backgroundColor: 'transparent',
                          borderRadius: '0',
                          border: 'none'
                        }}
                      >
                        <h5 style={{
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: '300',
                          margin: '0 0 1.5rem 0',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          Share your thoughts
                        </h5>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          We value your feedback to improve MENURU. Share your suggestions, report issues, or tell us what features you'd like to see in future updates.
                        </p>
                      </div>

                      <motion.button
                        onClick={handleSendFeedback}
                        style={{
                          padding: '1.5rem 3rem',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '0',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: '300',
                          cursor: 'pointer',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>Send feedback</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18"/>
                          <path d="M8 6h10v10"/>
                        </svg>
                      </motion.button>

                      <div
                        style={{
                          padding: '2.5rem',
                          backgroundColor: 'transparent',
                          borderRadius: '0',
                          border: 'none',
                          marginTop: '1rem'
                        }}
                      >
                        <h5 style={{
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: '300',
                          margin: '0 0 1.5rem 0',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          Contact support
                        </h5>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          Need immediate assistance? Contact our support team for help with technical issues or account-related questions.
                        </p>
                        <motion.button
                          onClick={() => router.push('/contact')}
                          style={{
                            padding: '1.2rem 2rem',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '0',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '300',
                            cursor: 'pointer',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '1.5rem'
                          }}
                        >
                          <span>Contact support</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18"/>
                            <path d="M8 6h10v10"/>
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteAccountModal && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.98)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowDeleteAccountModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: 'transparent',
                borderRadius: '0',
                padding: '2.5rem',
                width: isMobile ? '90%' : '500px',
                maxWidth: '600px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 style={{
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: '300',
                margin: '0 0 1.5rem 0',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '0.5px'
              }}>
                Delete account
              </h4>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: '0 0 2rem 0',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                Are you sure you want to delete your account? This action cannot be undone. 
                All your notes and data will be permanently deleted.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'flex-end'
              }}>
                <motion.button
                  onClick={() => setShowDeleteAccountModal(false)}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '300',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteAccount}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '300',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
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
              backgroundColor: 'rgba(0, 0, 0, 0.98)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
            onClick={handleCancelLogout}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: 'transparent',
                borderRadius: '0',
                padding: isMobile ? '1.5rem' : '2.5rem',
                width: isMobile ? '90%' : '500px',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h3 style={{
                  color: 'white',
                  fontSize: isMobile ? '2rem' : '2.5rem',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '0.5px'
                }}>
                  Logout
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.1rem',
                  margin: 0,
                  lineHeight: 1.6,
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  Are you sure you want to logout from {userDisplayName}?
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '1rem'
              }}>
                <motion.button
                  onClick={handleCancelLogout}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '300',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    opacity: 0.9
                  }}
                  whileHover={{ opacity: 1 }}
                >
                  <span>No</span>
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: 'rotate(180deg)' }}
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </motion.button>

                <div style={{
                  width: '1px',
                  height: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }} />

                <motion.button
                  onClick={handleConfirmLogout}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '300',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    opacity: 0.9
                  }}
                  whileHover={{ opacity: 1 }}
                >
                  <span>Yes</span>
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </motion.button>
              </div>

              <div style={{
                textAlign: 'center',
                marginTop: '0.5rem'
              }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.9rem',
                  margin: 0,
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  You can sign in again anytime
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                justifyContent: 'center',
                opacity: 0.7
              }}
            >
              ×
            </motion.div>
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
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: isMobile ? '45%' : '40%',
                marginTop: isMobile ? '1rem' : '2rem'
              }}>
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

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{
                    width: isMobile ? '95%' : '80%',
                    height: isMobile ? '350px' : '600px',
                    overflow: 'hidden',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.2)',
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
                      color: 'white',
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
                  >
                    EXPLORE FULL COLLECTION
                    <motion.svg
                      width={isMobile ? "24" : "32"}
                      height={isMobile ? "24" : "32"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </motion.svg>
                  </motion.a>
                </motion.div>

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
                  backgroundColor: 'transparent',
                  borderRadius: '50%',
                  zIndex: 9999,
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
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

      {/* Halaman Full Page untuk Foto dengan Komentar */}
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
                  order: 1,
                  opacity: 0.7
                }}
              >
                ×
              </motion.button>

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

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              flex: 1
            }}>
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
                        border: '1px solid rgba(255,255,255,0.2)',
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

              <div style={{
                flex: 1,
                padding: isMobile ? '1rem' : '2rem',
                paddingTop: '0',
                maxWidth: '800px',
                margin: '0 auto',
                width: '100%'
              }}>
                <div style={{
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255,255,255,0.2)'
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
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255,255,255,0.2)',
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
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '50%',
                        cursor: message.trim() === "" ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        flexShrink: 0
                      }}
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
                          backgroundColor: 'transparent',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
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
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
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
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)'
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

      {/* Notification Dropdown */}
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
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
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
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    padding: '0.1rem 0.6rem',
                    borderRadius: '10px',
                    marginLeft: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
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
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}
                  >
                    Clear All
                </motion.button>
                )}
                
                <motion.button
                  onClick={() => {
                    setIsLoadingNotifications(true);
                    setTimeout(() => setIsLoadingNotifications(false), 500);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  Refresh
                </motion.button>
              </div>
            </div>
            
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
                  color: 'rgba(255, 255, 255, 0.7)',
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
                  color: 'rgba(255, 255, 255, 0.7)',
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
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1.2rem',
                    margin: '0 0 0.5rem 0'
                  }}>
                    No notifications yet
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    margin: '0 0 1.5rem 0',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    Check back later for updates
                  </p>
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
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: notification.isRead ? 'transparent' : 'transparent',
                        position: 'relative'
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {!notification.read && (
                        <div style={{
                          position: 'absolute',
                          left: '0.5rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '8px',
                          height: '8px',
                          backgroundColor: 'white',
                          borderRadius: '50%'
                        }} />
                      )}
                      
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '10px',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          color: 'white'
                        }}>
                          {notification.icon}
                        </div>
                        
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
                              
                              <span style={{
                                backgroundColor: 'transparent',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                padding: '0.1rem 0.5rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                              }}>
                                {notification.type}
                              </span>
                              
                              {notification.isAdminPost && (
                                <span style={{
                                  backgroundColor: 'transparent',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                  padding: '0.1rem 0.5rem',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255, 255, 255, 0.3)'
                                }}>
                                  ADMIN
                                </span>
                              )}
                            </div>
                            
                            <span style={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap'
                            }}>
                              {calculateTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          
                          <p style={{
                            color: notification.read ? 'rgba(255, 255, 255, 0.8)' : 'white',
                            fontSize: '0.9rem',
                            margin: '0 0 0.5rem 0',
                            lineHeight: 1.4,
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            wordBreak: 'break-word'
                          }}>
                            {notification.message}
                          </p>
                          
                          {notification.isAdminPost && notification.adminName && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              marginTop: '0.3rem'
                            }}>
                              <span style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.75rem'
                              }}>
                                From:
                              </span>
                              <span style={{
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                {notification.adminName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              backgroundColor: 'transparent'
            }}>
              <div style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.8rem',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                {notifications.length} total • {notificationCount} unread
              </div>
              
              <motion.a
                href="/notifications"
                style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                View All
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </motion.a>
            </div>
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
          backgroundColor: 'transparent',
          padding: '0.5rem 1rem',
          borderRadius: '4px'
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
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
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
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
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
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem',
                  marginTop: '0.2rem'
                }}>
                  {user.email}
                </div>
              </div>
            </div>

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
                  color: 'white',
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
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <path d="M16 17l5-5-5-5"/>
                  <path d="M21 12H9"/>
                </svg>
                Logout
              </motion.button>
            </div>
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
          borderRadius: '50px',
          padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem',
          border: '1px solid rgba(255,255,255,0.2)'
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
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: 'white',
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
                stroke="white"
                strokeWidth="2"
              >
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </span>
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
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="8" y1="7" x2="16" y2="7"/>
              <line x1="8" y1="11" x2="12" y2="11"/>
            </svg>
            <span style={{
              color: 'white',
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
                stroke="white"
                strokeWidth="2"
              >
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </span>
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
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: 'white',
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
                stroke="white"
                strokeWidth="2"
              >
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </span>
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
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              <line x1="12" y1="7" x2="12" y2="13"/>
              <line x1="16" y1="11" x2="12" y2="7"/>
            </svg>
            <span style={{
              color: 'white',
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
                stroke="white"
                strokeWidth="2"
              >
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </span>
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
        
        {/* Right Side Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.8rem' : '1rem',
          position: 'relative'
        }}>
          {/* Search Bar dengan animasi GSAP dan dropdown results */}
          <motion.div
            ref={searchContainerRef}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              width: showSearch ? '350px' : '40px',
              height: showSearch ? 'auto' : '40px',
              borderRadius: '20px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 1002
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '40px',
              padding: '0 10px',
              boxSizing: 'border-box'
            }}>
              <motion.div
                onClick={handleSearchToggle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '100%',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginRight: '8px'
                }}
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={showSearch ? "white" : "white"} 
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </motion.div>
              
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyPress}
                placeholder="Search chatbot, sign in, notifikasi..."
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '0 8px',
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
              
              {showSearch && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    flexShrink: 0,
                    marginLeft: '8px'
                  }}
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
            </div>

            <AnimatePresence>
              {showSearch && showSearchResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(15, 15, 15, 0.98)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '10px 0'
                  }}
                >
                  <div style={{
                    padding: '0 15px 10px 15px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '5px'
                  }}>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Hasil Pencarian ({searchResults.length})
                    </div>
                  </div>

                  {searchResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      className="search-result-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearchResultClick(result.url)}
                      style={{
                        padding: '12px 15px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}>
                        {result.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '2px'
                        }}>
                          <div style={{
                            color: 'white',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {result.title}
                          </div>
                          <div style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            marginLeft: '8px',
                            flexShrink: 0,
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}>
                            {result.category}
                          </div>
                        </div>
                        
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '4px'
                        }}>
                          {result.description}
                        </div>
                        
                        <div style={{
                          color: 'white',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          {result.url}
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                          opacity: 0.5,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14"/>
                          <path d="M12 5l7 7-7 7"/>
                        </svg>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSearch && searchQuery.trim() && searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '20px 15px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(15, 15, 15, 0.98)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  Tidak ditemukan hasil untuk "{searchQuery}"
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    Coba kata kunci lain seperti: chatbot, sign in, notifikasi
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowNotification(!showNotification)}
          >
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
                  backgroundColor: 'transparent',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
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
          </motion.div>

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
          >
            MENU
          </motion.div>

          {/* Sign In / User Button - DIPERBAIKI dengan North East Arrow ketika sudah login */}
          <motion.div
            onClick={handleSignInClick}
            style={{
              color: 'white',
              fontSize: isMobile ? '1rem' : '1.5rem',
              fontWeight: '300',
              fontFamily: 'Helvetica, Arial, sans-serif',
              cursor: 'pointer',
              padding: isMobile ? '0.3rem 0.8rem' : '0.5rem 1rem',
              whiteSpace: 'nowrap',
              letterSpacing: '2px',
              position: 'relative',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            {user ? (
              <>
                {userDisplayName}
                <motion.svg
                  width={isMobile ? "14" : "16"}
                  height={isMobile ? "14" : "16"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    flexShrink: 0
                  }}
                >
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </motion.svg>
              </>
            ) : (
              <>
                SIGN IN
                <motion.svg
                  width={isMobile ? "14" : "16"}
                  height={isMobile ? "14" : "16"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    flexShrink: 0
                  }}
                >
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </motion.svg>
              </>
            )}
          </motion.div>
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

        {/* PRODUCT AND Image Section */}
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

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '1rem'
            }}>
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

              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end'
              }}>
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
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end'
            }}>
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

            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end'
            }}>
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
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end'
            }}>
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

        <AnimatePresence mode="wait">
          {currentView === "main" && (
            <motion.div
              key="main-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
