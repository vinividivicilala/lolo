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
  writeBatch,
  where,
  deleteDoc
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

// Type untuk note
interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  tags?: string[];
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
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
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

  // State untuk notifikasi dan search
  const [showNotification, setShowNotification] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // State untuk user profile modal
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'settings' | 'help' | 'feedback'>('notes');
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const topicContainerRef = useRef<HTMLDivElement>(null);
  const progressAnimationRef = useRef<gsap.core.Tween | null>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const userTextRef = useRef<HTMLSpanElement>(null);
  const leftCounterRef = useRef<HTMLSpanElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const chatbotPopupRef = useRef<HTMLDivElement>(null);
  const userProfileModalRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk notifikasi dan search
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Tambahkan state baru untuk search results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Animasi loading text
  const loadingTexts = [
    "NURU", "MBACA", "NULIS", "NGEXPLORASI", 
    "NEMUKAN", "NCIPTA", "NGGALI", "NARIK",
    "NGAMATI", "NANCANG", "NGEMBANGKAN", "NYUSUN"
  ];

  // Helper functions untuk notifikasi
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

  // Fungsi untuk load user notes
  const loadUserNotes = async (userId: string) => {
    try {
      setIsLoadingNotes(true);
      const notesRef = collection(db, 'notes');
      const q = query(
        notesRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notesData: Note[] = [];
      
      querySnapshot.forEach((doc) => {
        notesData.push({
          id: doc.id,
          ...doc.data()
        } as Note);
      });
      
      setUserNotes(notesData);
      setTotalNotes(notesData.length);
      setIsLoadingNotes(false);
    } catch (error) {
      console.error("Error loading user notes:", error);
      setIsLoadingNotes(false);
    }
  };

  // Fungsi untuk menghapus akun
  const handleDeleteAccount = async () => {
    try {
      if (!auth.currentUser) {
        alert("No user logged in");
        return;
      }

      const userId = auth.currentUser.uid;
      
      // Hapus semua data user dari Firestore
      // Notes
      const notesQuery = query(collection(db, 'notes'), where('userId', '==', userId));
      const notesSnapshot = await getDocs(notesQuery);
      const notesBatch = writeBatch(db);
      notesSnapshot.forEach((doc) => {
        notesBatch.delete(doc.ref);
      });
      await notesBatch.commit();

      // User stats
      const userStatsRef = doc(db, 'userStats', userId);
      await deleteDoc(userStatsRef).catch(() => {});

      // Delete user dari Firebase Auth
      await deleteUser(auth.currentUser);

      alert("Account deleted successfully");
      setShowDeleteAccountModal(false);
      setShowUserProfileModal(false);
      router.push('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  // Fungsi untuk mengirim feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim() || !user) {
      alert("Please enter feedback message");
      return;
    }

    try {
      const feedbackData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        message: feedbackMessage.trim(),
        createdAt: serverTimestamp(),
        type: 'feedback',
        status: 'new'
      };

      await addDoc(collection(db, 'feedbacks'), feedbackData);
      alert("Thank you for your feedback!");
      setFeedbackMessage("");
      setActiveTab('notes');
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  // Handler untuk membuka user profile modal
  const handleOpenUserProfile = () => {
    setShowUserProfileModal(true);
    setShowUserDropdown(false);
    if (user) {
      loadUserNotes(user.uid);
    }
  };

  // Handler untuk menutup user profile modal
  const handleCloseUserProfile = () => {
    setShowUserProfileModal(false);
    setActiveTab('notes');
    setFeedbackMessage("");
  };

  // Calculate time ago function
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

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || 
                     currentUser.email?.split('@')[0] || 
                     'User';
        setUserDisplayName(name);
        
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
      } else {
        setUser(null);
        setUserDisplayName("");
        setUserStats(null);
        setShowUserDropdown(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
      if (userProfileModalRef.current && !userProfileModalRef.current.contains(event.target as Node)) {
        handleCloseUserProfile();
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
      if (e.key === 'Escape') {
        if (showUserDropdown) {
          setShowUserDropdown(false);
        }
        if (showLogoutModal) {
          setShowLogoutModal(false);
        }
        if (showChatbotPopup) {
          setShowChatbotPopup(false);
        }
        if (showUserProfileModal) {
          handleCloseUserProfile();
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
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

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

  // Handler untuk Sign In / User Button
  const handleSignInClick = () => {
    if (user) {
      handleOpenUserProfile();
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

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
        {showUserProfileModal && user && (
          <motion.div
            ref={userProfileModalRef}
            key="user-profile-modal"
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
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                borderRadius: '20px',
                padding: isMobile ? '1.5rem' : '2rem',
                width: isMobile ? '95%' : '900px',
                maxWidth: '1200px',
                height: isMobile ? '90vh' : '85vh',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#0050B7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      margin: 0,
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {userDisplayName}
                    </h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.9rem',
                      margin: '0.2rem 0 0 0'
                    }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={handleCloseUserProfile}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    scale: 1.1
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  ×
                </motion.button>
              </div>

              {/* Tabs Navigation */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}>
                <motion.button
                  onClick={() => setActiveTab('notes')}
                  style={{
                    padding: '0.7rem 1.2rem',
                    backgroundColor: activeTab === 'notes' ? '#0050B7' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === 'notes' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📝 Notes ({totalNotes})
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    padding: '0.7rem 1.2rem',
                    backgroundColor: activeTab === 'settings' ? '#0050B7' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === 'settings' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⚙️ Settings
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('help')}
                  style={{
                    padding: '0.7rem 1.2rem',
                    backgroundColor: activeTab === 'help' ? '#0050B7' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === 'help' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ❓ Help
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('feedback')}
                  style={{
                    padding: '0.7rem 1.2rem',
                    backgroundColor: activeTab === 'feedback' ? '#0050B7' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === 'feedback' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💬 Feedback
                </motion.button>
              </div>

              {/* Content Area */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '0.5rem'
              }}>
                {activeTab === 'notes' && (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <h4 style={{
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        margin: 0
                      }}>
                        My Notes ({totalNotes})
                      </h4>
                      <motion.button
                        onClick={() => router.push('/notes')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'rgba(0, 255, 0, 0.2)',
                          border: '1px solid rgba(0, 255, 0, 0.4)',
                          borderRadius: '6px',
                          color: '#00FF00',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        whileHover={{ 
                          backgroundColor: 'rgba(0, 255, 0, 0.3)',
                          scale: 1.05
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        + New Note
                      </motion.button>
                    </div>

                    {isLoadingNotes ? (
                      <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }}>
                        Loading notes...
                      </div>
                    ) : userNotes.length === 0 ? (
                      <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.5)',
                        border: '1px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                        <h5 style={{ color: 'white', marginBottom: '0.5rem' }}>
                          No notes yet
                        </h5>
                        <p style={{ marginBottom: '1.5rem' }}>
                          Create your first note to get started
                        </p>
                        <motion.button
                          onClick={() => router.push('/notes')}
                          style={{
                            padding: '0.8rem 1.5rem',
                            backgroundColor: '#0050B7',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Create Note
                        </motion.button>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        {userNotes.slice(0, 10).map((note, index) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '10px',
                              padding: '1rem',
                              borderLeft: '4px solid #0050B7',
                              cursor: 'pointer'
                            }}
                            whileHover={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              transform: 'translateX(5px)'
                            }}
                            onClick={() => router.push(`/notes/${note.id}`)}
                          >
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '0.5rem'
                            }}>
                              <h5 style={{
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                margin: 0,
                                flex: 1
                              }}>
                                {note.title || 'Untitled Note'}
                              </h5>
                              <span style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.8rem',
                                whiteSpace: 'nowrap'
                              }}>
                                {calculateTimeAgo(note.createdAt)}
                              </span>
                            </div>
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.9rem',
                              margin: 0,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4
                            }}>
                              {note.content || 'No content'}
                            </p>
                            {note.tags && note.tags.length > 0 && (
                              <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginTop: '0.8rem',
                                flexWrap: 'wrap'
                              }}>
                                {note.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    style={{
                                      backgroundColor: 'rgba(0, 80, 183, 0.2)',
                                      color: '#0050B7',
                                      fontSize: '0.7rem',
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: '12px'
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                        
                        {userNotes.length > 10 && (
                          <div style={{
                            textAlign: 'center',
                            marginTop: '1rem'
                          }}>
                            <motion.button
                              onClick={() => router.push('/notes')}
                              style={{
                                padding: '0.6rem 1.2rem',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                              }}
                              whileHover={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white'
                              }}
                            >
                              View All Notes ({userNotes.length})
                            </motion.button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h4 style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      margin: '0 0 1.5rem 0'
                    }}>
                      Account Settings
                    </h4>

                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: '#0050B7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {userDisplayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.3rem'
                          }}>
                            {userDisplayName}
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.9rem'
                          }}>
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        <div>
                          <label style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}>
                            Login Method
                          </label>
                          <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.8rem 1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {user.providerData && user.providerData[0]?.providerId === 'github.com' ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                GitHub Login
                              </>
                            ) : user.providerData && user.providerData[0]?.providerId === 'google.com' ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                                </svg>
                                Google Login
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                  <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Email/Password Login
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}>
                            Email Address
                          </label>
                          <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.8rem 1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem'
                          }}>
                            {user.email}
                          </div>
                        </div>

                        <div>
                          <label style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}>
                            Account Created
                          </label>
                          <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.8rem 1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem'
                          }}>
                            {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(255, 71, 87, 0.1)',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      border: '1px solid rgba(255, 71, 87, 0.3)'
                    }}>
                      <h5 style={{
                        color: '#FF4757',
                        fontSize: '1rem',
                        fontWeight: '600',
                        margin: '0 0 1rem 0'
                      }}>
                        Danger Zone
                      </h5>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        margin: '0 0 1rem 0',
                        lineHeight: 1.5
                      }}>
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <motion.button
                        onClick={() => setShowDeleteAccountModal(true)}
                        style={{
                          padding: '0.8rem 1.5rem',
                          backgroundColor: 'rgba(255, 71, 87, 0.2)',
                          border: '1px solid rgba(255, 71, 87, 0.4)',
                          borderRadius: '8px',
                          color: '#FF4757',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        whileHover={{ 
                          backgroundColor: 'rgba(255, 71, 87, 0.3)',
                          scale: 1.05
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete Account
                      </motion.button>
                    </div>
                  </div>
                )}

                {activeTab === 'help' && (
                  <div>
                    <h4 style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      margin: '0 0 1.5rem 0'
                    }}>
                      Help & Support
                    </h4>

                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                      }}>
                        <div>
                          <h5 style={{
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: '0 0 0.8rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>📚</span> Documentation
                          </h5>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            margin: '0 0 1rem 0',
                            lineHeight: 1.5
                          }}>
                            Read our comprehensive documentation to learn more about features and how to use them.
                          </p>
                          <motion.button
                            onClick={() => router.push('/docs')}
                            style={{
                              padding: '0.6rem 1.2rem',
                              backgroundColor: 'rgba(0, 80, 183, 0.2)',
                              border: '1px solid rgba(0, 80, 183, 0.4)',
                              borderRadius: '8px',
                              color: '#0050B7',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                            whileHover={{ 
                              backgroundColor: 'rgba(0, 80, 183, 0.3)',
                              scale: 1.05
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Open Documentation
                          </motion.button>
                        </div>

                        <div>
                          <h5 style={{
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: '0 0 0.8rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>🤖</span> AI Chatbot Assistant
                          </h5>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            margin: '0 0 1rem 0',
                            lineHeight: 1.5
                          }}>
                            Get instant help from our AI-powered chatbot. Available 24/7 for any questions.
                          </p>
                          <motion.button
                            onClick={() => router.push('/chatbot')}
                            style={{
                              padding: '0.6rem 1.2rem',
                              backgroundColor: 'rgba(0, 255, 0, 0.1)',
                              border: '1px solid rgba(0, 255, 0, 0.3)',
                              borderRadius: '8px',
                              color: '#00FF00',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                            whileHover={{ 
                              backgroundColor: 'rgba(0, 255, 0, 0.2)',
                              scale: 1.05
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Open Chatbot
                          </motion.button>
                        </div>

                        <div>
                          <h5 style={{
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: '0 0 0.8rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>📧</span> Contact Support
                          </h5>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            margin: '0 0 1rem 0',
                            lineHeight: 1.5
                          }}>
                            Need direct assistance? Contact our support team for personalized help.
                          </p>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem'
                          }}>
                            Email: support@menuru.com
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'feedback' && (
                  <div>
                    <h4 style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      margin: '0 0 1.5rem 0'
                    }}>
                      Send Feedback
                    </h4>

                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '1.5rem'
                    }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          display: 'block',
                          marginBottom: '0.8rem'
                        }}>
                          Your Feedback
                        </label>
                        <textarea
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          placeholder="Tell us what you think, report bugs, or suggest features..."
                          style={{
                            width: '100%',
                            minHeight: '150px',
                            padding: '1rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            resize: 'vertical',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.8rem'
                        }}>
                          We appreciate your feedback to improve our service.
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '1rem'
                        }}>
                          <motion.button
                            onClick={() => setFeedbackMessage("")}
                            style={{
                              padding: '0.7rem 1.2rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                            whileHover={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              scale: 1.05
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Clear
                          </motion.button>
                          <motion.button
                            onClick={handleSubmitFeedback}
                            disabled={!feedbackMessage.trim()}
                            style={{
                              padding: '0.7rem 1.5rem',
                              backgroundColor: !feedbackMessage.trim() 
                                ? 'rgba(0, 80, 183, 0.5)' 
                                : '#0050B7',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: !feedbackMessage.trim() ? 'not-allowed' : 'pointer'
                            }}
                            whileHover={feedbackMessage.trim() ? { scale: 1.05 } : {}}
                            whileTap={feedbackMessage.trim() ? { scale: 0.95 } : {}}
                          >
                            Submit Feedback
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with Logout Button */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <motion.button
                  onClick={handleLogoutClick}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'rgba(255, 71, 87, 0.2)',
                    border: '1px solid rgba(255, 71, 87, 0.4)',
                    borderRadius: '8px',
                    color: '#FF4757',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 71, 87, 0.3)',
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE ACCOUNT MODAL */}
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
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowDeleteAccountModal(false)}
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
                width: isMobile ? '90%' : '500px',
                maxWidth: '600px',
                border: '1px solid rgba(255, 71, 87, 0.3)',
                boxShadow: '0 20px 60px rgba(255, 71, 87, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(255, 71, 87, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF4757" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 style={{
                  color: '#FF4757',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0'
                }}>
                  Delete Account
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  margin: '0 0 1rem 0',
                  lineHeight: 1.5
                }}>
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div style={{
                  backgroundColor: 'rgba(255, 71, 87, 0.1)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left'
                }}>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.85rem',
                    margin: '0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <span>⚠️</span>
                    All your data including notes, comments, and preferences will be permanently deleted.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <motion.button
                  onClick={() => setShowDeleteAccountModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteAccount}
                  style={{
                    flex: 1,
                    padding: '0.8rem 1.5rem',
                    backgroundColor: '#FF4757',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  whileHover={{ 
                    backgroundColor: '#FF6B6B',
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete Account
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
            </div>
            
            {/* List Notifikasi */}
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
                        backgroundColor: getBgColorByType(notification.type),
                        position: 'relative'
                      }}
                      whileHover={{ 
                        backgroundColor: getBgColorByType(notification.type).replace('0.1', '0.2')
                      }}
                    >
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
                          backgroundColor: `${getColorByType(notification.type)}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          color: getColorByType(notification.type)
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
                            </div>
                            
                            <span style={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap'
                            }}>
                              {calculateTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          
                          <p style={{
                            color: 'white',
                            fontSize: '0.9rem',
                            margin: '0 0 0.5rem 0',
                            lineHeight: 1.4,
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            wordBreak: 'break-word'
                          }}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
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

      {/* POPUP CHATBOT */}
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
          {/* Tombol Slider Index/Grid */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginRight: '0.5rem'
          }}>
            <motion.button
              onClick={toggleSlider}
              style={{
                width: '100px',
                height: '40px',
                backgroundColor: '#0050B7',
                border: 'none',
                borderRadius: '20px',
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
                padding: '0 12px',
                boxSizing: 'border-box'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  opacity: sliderPosition === "index" ? 1 : 0.5
                }}>
                  INDEX
                </span>
                <span style={{
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  opacity: sliderPosition === "grid" ? 1 : 0.5
                }}>
                  GRID
                </span>
              </div>
              
              <motion.div
                animate={{ x: sliderPosition === "index" ? 12 : 52 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#00FF00',
                  borderRadius: '50%',
                  position: 'absolute',
                  left: '6px',
                  boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)'
                }}
              />
            </motion.button>
          </div>

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
              backgroundColor: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 1002,
              boxShadow: showSearch ? '0 20px 60px rgba(0, 0, 0, 0.5)' : 'none'
            }}
          >
            {/* Search Input Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '40px',
              padding: '0 10px',
              boxSizing: 'border-box'
            }}>
              {/* Search Icon */}
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
              
              {/* Clear/X Button */}
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
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    flexShrink: 0,
                    marginLeft: '8px'
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
            </div>

            {/* Search Results Dropdown */}
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
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px 0'
                  }}
                >
                  {/* Search Results Header */}
                  <div style={{
                    padding: '0 15px 10px 15px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    marginBottom: '5px'
                  }}>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Hasil Pencarian ({searchResults.length})
                    </div>
                  </div>

                  {/* Search Results List */}
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
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                      }}
                      whileHover={{ 
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        paddingLeft: '20px'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}>
                        {result.icon}
                      </div>

                      {/* Content */}
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
                            backgroundColor: 'rgba(0, 80, 183, 0.3)',
                            color: '#0050B7',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            marginLeft: '8px',
                            flexShrink: 0
                          }}>
                            {result.category}
                          </div>
                        </div>
                        
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '4px'
                        }}>
                          {result.description}
                        </div>
                        
                        <div style={{
                          color: '#00FF00',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          {result.url}
                        </div>
                      </div>

                      {/* Arrow Indicator */}
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
                          <path d="m12 5 7 7-7 7"/>
                        </svg>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Results Message */}
            <AnimatePresence>
              {showSearch && searchQuery.trim() && searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '20px 15px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(15, 15, 15, 0.98)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
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
      </div>
    </div>
  );
}
