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
  read?: boolean;
}

// Type untuk note
interface Note {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Timestamp | Date;
  category?: string;
  isPrivate?: boolean;
}

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [loadingText, setLoadingText] = useState("NURU");
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"main" | "index" | "grid">("main");
  const [sliderPosition, setSliderPosition] = useState<"index" | "grid">("grid");
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
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
  
  // State untuk komentar
  const [message, setMessage] = useState("");
  
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

  // State baru untuk profil modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [loginMethod, setLoginMethod] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const headerRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const topicContainerRef = useRef<HTMLDivElement>(null);
  const progressAnimationRef = useRef<gsap.core.Tween | null>(null);
  const plusSignRef = useRef<HTMLDivElement>(null);
  const backslashRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const userTextRef = useRef<HTMLSpanElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const chatbotPopupRef = useRef<HTMLDivElement>(null);
  const profileModalRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk notifikasi dan search
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // State untuk search results
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

  // Fungsi untuk mendapatkan login method
  const getLoginMethod = (user: any): string => {
    if (!user) return "";
    
    if (user.providerData && user.providerData.length > 0) {
      const provider = user.providerData[0].providerId;
      switch (provider) {
        case 'github.com':
          return 'GitHub';
        case 'google.com':
          return 'Google';
        case 'password':
          return 'Email & Password';
        default:
          return 'Unknown';
      }
    }
    return 'Email & Password';
  };

  // Load user notes
  useEffect(() => {
    if (user && showProfileModal) {
      loadUserNotes();
    }
  }, [user, showProfileModal]);

  const loadUserNotes = async () => {
    if (!user || !db) return;
    
    setIsLoadingNotes(true);
    try {
      const notesRef = collection(db, 'notes');
      const q = query(
        notesRef, 
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
      }, (error) => {
        console.error("Error loading notes:", error);
        setIsLoadingNotes(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error in loadUserNotes:", error);
      setIsLoadingNotes(false);
    }
  };

  // Fungsi untuk menghapus akun
  const handleDeleteAccount = async () => {
    if (!user || !auth || !db) return;
    
    const confirmed = confirm("Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.");
    if (!confirmed) return;
    
    try {
      // Hapus data user dari Firestore
      const userStatsRef = doc(db, 'userStats', user.uid);
      await setDoc(userStatsRef, { isDeleted: true }, { merge: true });
      
      // Hapus notes user
      const notesQuery = query(collection(db, 'notes'), where('userId', '==', user.uid));
      const notesSnapshot = await getDocs(notesQuery);
      const batch = writeBatch(db);
      notesSnapshot.forEach((noteDoc) => {
        batch.delete(noteDoc.ref);
      });
      await batch.commit();
      
      // Delete user dari Firebase Auth
      await user.delete();
      
      // Reset state
      setShowProfileModal(false);
      setUser(null);
      setUserDisplayName("");
      setUserStats(null);
      setUserNotes([]);
      setTotalNotes(0);
      
      alert("Akun berhasil dihapus.");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(`Gagal menghapus akun: ${error.message}`);
    }
  };

  // Fungsi untuk mengirim feedback
  const handleSendFeedback = () => {
    const feedback = prompt("Masukkan feedback atau saran Anda:");
    if (feedback && feedback.trim()) {
      alert("Terima kasih atas feedback Anda!");
      // Di sini bisa ditambahkan kode untuk menyimpan feedback ke Firebase
    }
  };

  // Handler untuk membuka modal profil
  const handleOpenProfileModal = () => {
    setShowUserDropdown(false);
    setShowProfileModal(true);
    
    // Set login method dan email
    if (user) {
      setLoginMethod(getLoginMethod(user));
      setUserEmail(user.email || "");
    }
  };

  // Handler untuk menutup modal profil
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
  };

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
        setShowProfileModal(false);
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
                console.log(`⏭️ Skip notifikasi ${doc.id} karena deleted`);
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
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotification(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (profileModalRef.current && !profileModalRef.current.contains(event.target as Node)) {
        handleCloseProfileModal();
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
        if (showNotification) {
          setShowNotification(false);
        }
        if (showSearch) {
          setShowSearch(false);
        }
        if (showProfileModal) {
          handleCloseProfileModal();
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
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile, showUserDropdown, showLogoutModal, showChatbotPopup, showNotification, showSearch, showProfileModal]);

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

  // Handler untuk Sign In / User Button
  const handleSignInClick = () => {
    if (user) {
      handleOpenProfileModal();
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
    setShowProfileModal(false);
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
      setUserNotes([]);
      setTotalNotes(0);
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

      {/* Modal Profil User */}
      <AnimatePresence>
        {showProfileModal && user && (
          <motion.div
            ref={profileModalRef}
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
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)',
              padding: isMobile ? '1rem' : '2rem'
            }}
            onClick={handleCloseProfileModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                borderRadius: '20px',
                width: isMobile ? '100%' : '800px',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(10, 10, 10, 0.8)'
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
                    fontSize: '1.8rem',
                    fontWeight: '600',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{
                      color: 'white',
                      fontSize: '1.8rem',
                      fontWeight: '600',
                      margin: 0,
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {userDisplayName}
                    </h2>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.9rem',
                      margin: '0.3rem 0 0 0'
                    }}>
                      Profile Settings
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={handleCloseProfileModal}
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
                    padding: 0,
                    margin: 0
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

              {/* Konten Modal */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1.5rem' : '2rem'
              }}>
                {/* Stats Section */}
                <div style={{
                  backgroundColor: 'rgba(0, 80, 183, 0.1)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(0, 80, 183, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      margin: 0,
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      User Statistics
                    </h3>
                    <div style={{
                      backgroundColor: '#00FF00',
                      color: 'black',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px'
                    }}>
                      Active
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '1rem'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      padding: '1rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        Total Notes
                      </div>
                      <div style={{
                        color: '#00FF00',
                        fontSize: '2rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif'
                      }}>
                        {totalNotes}
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      padding: '1rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        Login Count
                      </div>
                      <div style={{
                        color: '#0050B7',
                        fontSize: '2rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif'
                      }}>
                        {userStats?.loginCount || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes History */}
                <div style={{
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      margin: 0,
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      Notes History ({totalNotes})
                    </h3>
                    <motion.button
                      onClick={() => router.push('/notes')}
                      style={{
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        border: '1px solid rgba(0, 255, 0, 0.3)',
                        color: '#00FF00',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        fontFamily: 'Helvetica, Arial, sans-serif'
                      }}
                      whileHover={{ backgroundColor: 'rgba(0, 255, 0, 0.2)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All
                    </motion.button>
                  </div>
                  
                  {isLoadingNotes ? (
                    <div style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      Loading notes...
                    </div>
                  ) : userNotes.length === 0 ? (
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '2rem',
                      borderRadius: '10px',
                      textAlign: 'center',
                      border: '1px dashed rgba(255, 255, 255, 0.1)'
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
                        No notes yet
                      </h4>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.9rem',
                        margin: '0 0 1.5rem 0'
                      }}>
                        Start creating your first note!
                      </p>
                      <motion.button
                        onClick={() => router.push('/notes')}
                        style={{
                          backgroundColor: '#0050B7',
                          color: 'white',
                          border: 'none',
                          padding: '0.8rem 1.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}
                        whileHover={{ backgroundColor: '#0066CC' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Create Note
                      </motion.button>
                    </div>
                  ) : (
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {userNotes.slice(0, 5).map((note, index) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          style={{
                            padding: '1rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          onClick={() => router.push(`/notes?note=${note.id}`)}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                          }}>
                            <div style={{
                              color: 'white',
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              flex: 1,
                              marginRight: '1rem'
                            }}>
                              {note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}
                            </div>
                            <span style={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap'
                            }}>
                              {calculateTimeAgo(note.timestamp)}
                            </span>
                          </div>
                          {note.category && (
                            <span style={{
                              backgroundColor: 'rgba(0, 80, 183, 0.3)',
                              color: '#0050B7',
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              display: 'inline-block',
                              marginTop: '0.5rem'
                            }}>
                              {note.category}
                            </span>
                          )}
                        </motion.div>
                      ))}
                      {userNotes.length > 5 && (
                        <div style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.9rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                          + {userNotes.length - 5} more notes
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Account Settings */}
                <div style={{
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    margin: '0 0 1rem 0',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Account Settings
                  </h3>
                  
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '1rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          marginBottom: '0.2rem'
                        }}>
                          Login Method
                        </div>
                        <div style={{
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '500'
                        }}>
                          {loginMethod}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: 'rgba(0, 80, 183, 0.2)',
                        color: '#0050B7',
                        fontSize: '0.8rem',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        fontWeight: '600'
                      }}>
                        Connected
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '1rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        marginBottom: '0.2rem'
                      }}>
                        Email Address
                      </div>
                      <div style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '500',
                        wordBreak: 'break-all'
                      }}>
                        {userEmail}
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          marginBottom: '0.2rem'
                        }}>
                          Account Status
                        </div>
                        <div style={{
                          color: '#00FF00',
                          fontSize: '1rem',
                          fontWeight: '500'
                        }}>
                          Active
                        </div>
                      </div>
                      <motion.button
                        onClick={handleDeleteAccount}
                        style={{
                          backgroundColor: 'rgba(255, 71, 87, 0.1)',
                          border: '1px solid rgba(255, 71, 87, 0.3)',
                          color: '#FF4757',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}
                        whileHover={{ backgroundColor: 'rgba(255, 71, 87, 0.2)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete Account
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Help & Feedback */}
                <div style={{
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    margin: '0 0 1rem 0',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Help & Feedback
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '1rem'
                  }}>
                    <motion.button
                      onClick={() => router.push('/help')}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        transition: 'all 0.3s ease'
                      }}
                      whileHover={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 80, 183, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}>
                        ❓
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600' }}>Help Center</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.2rem' }}>Get help and support</div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      onClick={handleSendFeedback}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        transition: 'all 0.3s ease'
                      }}
                      whileHover={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 255, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}>
                        💬
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600' }}>Send Feedback</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.2rem' }}>Share your thoughts</div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Logout Button */}
                <div style={{
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <motion.button
                    onClick={handleLogoutClick}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 71, 87, 0.1)',
                      border: '1px solid rgba(255, 71, 87, 0.3)',
                      color: '#FF4757',
                      padding: '1rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.8rem',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255, 71, 87, 0.2)',
                      border: '1px solid rgba(255, 71, 87, 0.5)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout from {userDisplayName}
                  </motion.button>
                </div>
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
         {/* Tombol Slider Index/Grid di samping search */}
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
                animate={{ x: sliderPosition === "index" ? 10 : 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: '#00FF00',
                  borderRadius: '50%',
                  position: 'absolute',
                  left: '5px',
                  boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)'
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

      {/* Cookie Notification */}
      <AnimatePresence>
        {showCookieNotification && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '1.5rem',
              width: isMobile ? '90%' : '500px',
              maxWidth: '600px',
              zIndex: 9999,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 80, 183, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                🍪
              </div>
              <h3 style={{
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: 0,
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                Cookie Consent
              </h3>
            </div>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              margin: 0,
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <motion.button
                onClick={() => {
                  localStorage.setItem('cookiesAccepted', 'true');
                  setShowCookieNotification(false);
                }}
                style={{
                  backgroundColor: '#0050B7',
                  color: 'white',
                  border: 'none',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}
                whileHover={{ backgroundColor: '#0066CC' }}
                whileTap={{ scale: 0.95 }}
              >
                Accept Cookies
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
