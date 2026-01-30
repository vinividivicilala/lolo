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
  where
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
  userEmail?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
}

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [loadingText, setLoadingText] = useState("NURU");
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"main" | "index" | "grid">("main");
  const [sliderPosition, setSliderPosition] = useState<"index" | "grid">("grid");
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalLoggedInUsers, setTotalLoggedInUsers] = useState(0);
  
  // State untuk user notes
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  // State untuk profil user
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loginMethod, setLoginMethod] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  
  // State untuk popup chatbot
  const [showChatbotPopup, setShowChatbotPopup] = useState(true);
  
  // State untuk search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // State untuk notifikasi
  const [showNotification, setShowNotification] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const userTextRef = useRef<HTMLSpanElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userProfileModalRef = useRef<HTMLDivElement>(null);
  const chatbotPopupRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk search
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk notifikasi
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

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

  // Data untuk Roles
  const rolesData = [
    { title: "My Roles", description: "Branding & Creative Direction" },
    { title: "Design", description: "Visual identity & UI/UX" },
    { title: "Development", description: "Frontend & Backend" },
    { title: "Features", description: "Functionality & Integration" }
  ];

  // Fungsi untuk melakukan pencarian
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    
    // Filter berdasarkan title atau description
    const results = searchablePages.filter(page => 
      page.title.toLowerCase().includes(lowerQuery) ||
      page.description.toLowerCase().includes(lowerQuery) ||
      page.category.toLowerCase().includes(lowerQuery)
    );

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
    
    // Animasi GSAP untuk munculnya results
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

  const getBgColorByType = (type: string): string => {
    const color = getColorByType(type);
    return color + '20';
  };

  // Fungsi untuk load user notes
  const loadUserNotes = async (userId: string) => {
    if (!db) return;
    
    setIsLoadingNotes(true);
    try {
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notesData: Note[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notesData.push({
            id: doc.id,
            title: data.title || "Untitled",
            content: data.content || "",
            userId: data.userId,
            userName: data.userName || "User",
            userEmail: data.userEmail,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt || data.createdAt,
            category: data.category,
            tags: data.tags || [],
            isPinned: data.isPinned || false
          } as Note);
        });
        
        setUserNotes(notesData);
        setTotalNotes(notesData.length);
        setIsLoadingNotes(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error loading user notes:", error);
      setIsLoadingNotes(false);
    }
  };

  // Fungsi untuk load user profile
  const loadUserProfile = async (userId: string, userData: any) => {
    try {
      // Tentukan metode login
      let method = "Email";
      if (userData.providerData && userData.providerData.length > 0) {
        const providerId = userData.providerData[0].providerId;
        if (providerId.includes('github')) {
          method = "GitHub";
        } else if (providerId.includes('google')) {
          method = "Google";
        }
      }
      setLoginMethod(method);
      
      // Simpan data profil
      setUserProfile({
        uid: userId,
        displayName: userData.displayName || userData.email?.split('@')[0] || 'User',
        email: userData.email,
        photoURL: userData.photoURL,
        loginMethod: method,
        createdAt: userData.metadata?.creationTime,
        lastLogin: userData.metadata?.lastSignInTime
      });
      
      // Set nama untuk editing
      setEditedName(userData.displayName || userData.email?.split('@')[0] || 'User');
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  // Fungsi untuk update nama user
  const updateUserName = async () => {
    if (!user || !editedName.trim()) return;
    
    try {
      // Update di Firebase Auth
      await updateProfile(user, {
        displayName: editedName.trim()
      });
      
      // Update di Firestore
      const userStatsRef = doc(db, 'userStats', user.uid);
      await updateDoc(userStatsRef, {
        userName: editedName.trim(),
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUserDisplayName(editedName.trim());
      setUserProfile((prev: any) => ({
        ...prev,
        displayName: editedName.trim()
      }));
      
      setIsEditingName(false);
      alert("Nama berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating user name:", error);
      alert("Gagal memperbarui nama. Silakan coba lagi.");
    }
  };

  // Fungsi untuk hapus akun
  const handleDeleteAccount = async () => {
    if (!user || !window.confirm("Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    
    try {
      // Hapus data user dari Firestore
      const batch = writeBatch(db);
      
      // Hapus user stats
      const userStatsRef = doc(db, 'userStats', user.uid);
      batch.delete(userStatsRef);
      
      // Hapus catatan user
      const notesRef = collection(db, 'notes');
      const userNotesQuery = query(notesRef, where('userId', '==', user.uid));
      const notesSnapshot = await getDocs(userNotesQuery);
      notesSnapshot.forEach((noteDoc) => {
        batch.delete(noteDoc.ref);
      });
      
      await batch.commit();
      
      // Hapus user dari Firebase Auth
      await deleteUser(user);
      
      // Logout dan redirect
      await signOut(auth);
      setUser(null);
      setShowUserProfileModal(false);
      router.push('/');
      alert("Akun berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Gagal menghapus akun. Silakan coba lagi.");
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
        
        // Load user profile
        loadUserProfile(currentUser.uid, currentUser);
        
        // Load user notes
        loadUserNotes(currentUser.uid);
      } else {
        setUser(null);
        setUserDisplayName("");
        setUserStats(null);
        setUserProfile(null);
        setUserNotes([]);
        setShowUserProfileModal(false);
        setShowUserDropdown(false);
      }
    });

    return () => unsubscribe();
  }, []);

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

  // Animasi teks nama user berjalan
  useEffect(() => {
    if (user && userTextRef.current && userButtonRef.current) {
      const textWidth = userTextRef.current.scrollWidth;
      const buttonWidth = userButtonRef.current.clientWidth;
      
      if (textWidth > buttonWidth) {
        const animation = gsap.to(userTextRef.current, {
          x: -(textWidth - buttonWidth + 20),
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });

        return () => {
          animation.kill();
        };
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (userProfileModalRef.current && !userProfileModalRef.current.contains(event.target as Node)) {
        setShowUserProfileModal(false);
      }
      if (chatbotPopupRef.current && !chatbotPopupRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        const isChatbotNavButton = target.closest('[data-nav-chatbot]');
        if (!isChatbotNavButton) {
          setShowChatbotPopup(false);
        }
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

  // Initialize
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
      if (e.key === 'Escape') {
        if (showUserProfileModal) {
          setShowUserProfileModal(false);
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
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile, showUserProfileModal, showUserDropdown, showLogoutModal, showChatbotPopup, showNotification, showSearch]);

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

  // Handler untuk Sign In / User Button
  const handleSignInClick = () => {
    if (user) {
      setShowUserProfileModal(true);
    } else {
      router.push('/signin');
    }
  };

  // Handler untuk login dengan GitHub
  const handleGitHubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      console.log("GitHub login successful:", result.user);
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

      {/* Modal Profil User - Full Page */}
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
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Header dengan tombol close */}
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
              backgroundColor: 'rgba(20, 20, 20, 0.9)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}>
              {/* Judul Profil */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
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
                  <h2 style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Profil Saya
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    margin: '0.2rem 0 0 0'
                  }}>
                    Kelola akun dan catatan Anda
                  </p>
                </div>
              </div>

              {/* Tombol Close */}
              <motion.button
                onClick={() => setShowUserProfileModal(false)}
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
                  justifyContent: 'center',
                  padding: 0
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

            {/* Konten Profil */}
            <div style={{
              flex: 1,
              padding: isMobile ? '1.5rem' : '2rem',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}>
              {/* Section 1: Info Profil */}
              <div style={{
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                borderRadius: '15px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  margin: '0 0 1.5rem 0',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Informasi Profil
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {/* Nama User - Editable */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <label style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        Nama
                      </label>
                      {!isEditingName ? (
                        <motion.button
                          onClick={() => setIsEditingName(true)}
                          style={{
                            backgroundColor: 'rgba(0, 80, 183, 0.2)',
                            border: '1px solid rgba(0, 80, 183, 0.4)',
                            color: '#0050B7',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          whileHover={{ 
                            backgroundColor: 'rgba(0, 80, 183, 0.3)',
                            scale: 1.05
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <motion.button
                            onClick={updateUserName}
                            style={{
                              backgroundColor: '#00FF00',
                              border: 'none',
                              color: 'black',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              padding: '0.3rem 0.8rem',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Simpan
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setIsEditingName(false);
                              setEditedName(userDisplayName);
                            }}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              padding: '0.3rem 0.8rem',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Batal
                          </motion.button>
                        </div>
                      )}
                    </div>
                    
                    {isEditingName ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.8rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(0, 80, 183, 0.5)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1rem',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          outline: 'none'
                        }}
                        autoFocus
                      />
                    ) : (
                      <div style={{
                        padding: '0.8rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        {userDisplayName}
                      </div>
                    )}
                  </div>

                  {/* Email - Non Editable */}
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Email Address
                    </label>
                    <div style={{
                      padding: '0.8rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{user.email}</span>
                      <span style={{
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        color: '#00FF00',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(0, 255, 0, 0.3)'
                      }}>
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Login Method */}
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Login Method
                    </label>
                    <div style={{
                      padding: '0.8rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem'
                    }}>
                      {loginMethod === 'GitHub' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                      {loginMethod === 'Google' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                        </svg>
                      )}
                      {loginMethod === 'Email' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      )}
                      <span>{loginMethod}</span>
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(0, 80, 183, 0.1)',
                      border: '1px solid rgba(0, 80, 183, 0.3)',
                      borderRadius: '10px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        color: '#0050B7',
                        fontSize: '2rem',
                        fontWeight: '700',
                        marginBottom: '0.3rem'
                      }}>
                        {userStats?.loginCount || 0}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.8rem'
                      }}>
                        Total Login
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(0, 255, 0, 0.1)',
                      border: '1px solid rgba(0, 255, 0, 0.3)',
                      borderRadius: '10px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        color: '#00FF00',
                        fontSize: '2rem',
                        fontWeight: '700',
                        marginBottom: '0.3rem'
                      }}>
                        {totalNotes}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.8rem'
                      }}>
                        Total Notes
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(255, 71, 87, 0.1)',
                      border: '1px solid rgba(255, 71, 87, 0.3)',
                      borderRadius: '10px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        color: '#FF4757',
                        fontSize: '2rem',
                        fontWeight: '700',
                        marginBottom: '0.3rem'
                      }}>
                        {new Date(user.metadata?.creationTime).toLocaleDateString('id-ID')}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.8rem'
                      }}>
                        Joined Date
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Riwayat Notes */}
              <div style={{
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                borderRadius: '15px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    Riwayat Notes ({totalNotes})
                  </h3>
                  
                  <motion.button
                    onClick={() => router.push('/notes')}
                    style={{
                      backgroundColor: 'rgba(0, 255, 0, 0.1)',
                      border: '1px solid rgba(0, 255, 0, 0.3)',
                      color: '#00FF00',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(0, 255, 0, 0.2)',
                      scale: 1.05
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Buat Note Baru
                  </motion.button>
                </div>

                {isLoadingNotes ? (
                  <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)'
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
                    Memuat catatan...
                  </div>
                ) : userNotes.length === 0 ? (
                  <div style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    <div style={{ 
                      fontSize: '3rem',
                      marginBottom: '1rem',
                      opacity: 0.5
                    }}>
                      📝
                    </div>
                    <h4 style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1.2rem',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Belum ada catatan
                    </h4>
                    <p style={{
                      fontSize: '0.9rem',
                      margin: '0 0 1.5rem 0',
                      color: 'rgba(255, 255, 255, 0.4)'
                    }}>
                      Mulai buat catatan pertama Anda
                    </p>
                    <motion.button
                      onClick={() => router.push('/notes')}
                      style={{
                        backgroundColor: '#00FF00',
                        color: 'black',
                        border: 'none',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        margin: '0 auto'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Buat Note Pertama
                    </motion.button>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    paddingRight: '0.5rem'
                  }}>
                    {userNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        whileHover={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderColor: 'rgba(0, 80, 183, 0.5)'
                        }}
                        onClick={() => router.push(`/notes?edit=${note.id}`)}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem'
                        }}>
                          <h4 style={{
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: 0,
                            flex: 1
                          }}>
                            {note.title}
                          </h4>
                          <span style={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }}>
                            {note.createdAt instanceof Timestamp 
                              ? note.createdAt.toDate().toLocaleDateString('id-ID')
                              : new Date(note.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.85rem',
                          margin: '0 0 0.8rem 0',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {note.content}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          {note.category && (
                            <span style={{
                              backgroundColor: 'rgba(0, 80, 183, 0.2)',
                              color: '#0050B7',
                              fontSize: '0.7rem',
                              fontWeight: '500',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              border: '1px solid rgba(0, 80, 183, 0.3)'
                            }}>
                              {note.category}
                            </span>
                          )}
                          
                          {note.isPinned && (
                            <span style={{
                              backgroundColor: 'rgba(255, 193, 7, 0.2)',
                              color: '#FFC107',
                              fontSize: '0.7rem',
                              fontWeight: '500',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 193, 7, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              Pinned
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Pengaturan & Lainnya */}
              <div style={{
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                borderRadius: '15px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  margin: '0 0 1.5rem 0',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Pengaturan & Lainnya
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {/* Help */}
                  <motion.button
                    onClick={() => router.push('/help')}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '1rem',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingLeft: '1.2rem'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span>Bantuan & FAQ</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </motion.button>

                  {/* Feedback */}
                  <motion.button
                    onClick={() => router.push('/feedback')}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '1rem',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingLeft: '1.2rem'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                      <span>Kirim Feedback</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </motion.button>

                  {/* Delete Account */}
                  <motion.button
                    onClick={handleDeleteAccount}
                    style={{
                      backgroundColor: 'rgba(255, 71, 87, 0.1)',
                      border: '1px solid rgba(255, 71, 87, 0.3)',
                      borderRadius: '10px',
                      padding: '1rem',
                      color: '#FF4757',
                      fontSize: '1rem',
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      marginTop: '1rem'
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255, 71, 87, 0.2)',
                      paddingLeft: '1.2rem'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      <span>Hapus Akun</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </motion.button>

                  {/* Logout Button */}
                  <motion.button
                    onClick={handleLogoutClick}
                    style={{
                      backgroundColor: 'rgba(255, 107, 107, 0.1)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      borderRadius: '10px',
                      padding: '1rem',
                      color: '#ff6b6b',
                      fontSize: '1rem',
                      fontWeight: '600',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      marginTop: '1rem'
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255, 107, 107, 0.2)',
                      paddingLeft: '1.2rem'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>Logout</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </motion.button>
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
              zIndex: 10000,
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
            {/* ... (kode chatbot popup tetap sama) ... */}
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
            {/* ... (kode dropdown user tetap sama) ... */}
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
          {/* ... (kode navigation buttons tetap sama) ... */}
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
          {/* Tombol Slider Index/Grid di samping search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
                padding: '0 15px',
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
                  boxShadow: '0 0 10px rgba(0, 255, 0, 0.7)'
                }}
              />
            </motion.button>
          </div>

          {/* Search Bar */}
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
            {/* ... (kode search bar tetap sama) ... */}
          </motion.div>

          {/* Notification Bell */}
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
            {/* ... (kode notification bell tetap sama) ... */}
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
                      paddingRight: '20px'
                    }}
                  >
                    {userDisplayName}
                  </motion.span>
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
        {/* Hapus semua section design collection dan slider foto */}
        
        {/* Simple Welcome Message */}
        <div style={{
          width: '100%',
          padding: isMobile ? '2rem' : '4rem',
          textAlign: 'center'
        }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              color: 'white',
              fontSize: isMobile ? '2.5rem' : '4rem',
              fontWeight: '700',
              marginBottom: '1rem',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}
          >
            Welcome to MENURU
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            A personal branding journal documenting emotional journeys and creative exploration through visual storytelling.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
