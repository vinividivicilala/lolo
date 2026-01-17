
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
  increment
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
  
  // State baru untuk popup chatbot
  const [showChatbotPopup, setShowChatbotPopup] = useState(true); // Default true untuk testing
  
  // State untuk counter foto - angka kiri saja yang berubah
  const [leftCounter, setLeftCounter] = useState("01");
  const totalPhotos = "03"; // Tetap konstan
  
  // State untuk posisi gambar di halaman Index (semakin turun)
  const [imagePosition, setImagePosition] = useState(0);
  
  // State untuk komentar
  const [message, setMessage] = useState("");
  const [photoTimeAgo, setPhotoTimeAgo] = useState<string[]>([]);
  
  // State untuk komentar dari Firebase
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const topicContainerRef = useRef<HTMLDivElement>(null);
  const progressAnimationRef = useRef<gsap.core.Tween | null>(null);
  const userButtonRef = useRef<HTMLDivElement>(null);
  const userTextRef = useRef<HTMLSpanElement>(null);
  const leftCounterRef = useRef<HTMLSpanElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const chatbotPopupRef = useRef<HTMLDivElement>(null);

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
      uploadTime: new Date(Date.now() - 5 * 60 * 1000) // 5 menit lalu
    },
    { 
      id: 2, 
      src: "images/6.jpg", 
      alt: "Photo 2",
      uploadTime: new Date(Date.now() - 2 * 60 * 1000) // 2 menit lalu
    },
    { 
      id: 3, 
      src: "images/5.jpg", 
      alt: "Photo 3",
      uploadTime: new Date(Date.now() - 30 * 1000) // 30 detik lalu
    }
  ];

  // Data untuk 6 foto portrait sejajar - DIUBAH
  const portraitPhotos = [
    {
      id: 1,
      src: "images/5.jpg",
      alt: "Project 1",
      title: "View Project",
      linkText: "View Project",
      linkUrl: "/projects/1"
    },
    {
      id: 2,
      src: "images/6.jpg",
      alt: "Project 2",
      title: "Explore Story",
      linkText: "Explore Story",
      linkUrl: "/projects/2"
    },
    {
      id: 3,
      src: "images/5.jpg",
      alt: "Project 3",
      title: "See Process",
      linkText: "See Process",
      linkUrl: "/projects/3"
    },
    {
      id: 4,
      src: "images/6.jpg",
      alt: "Project 4",
      title: "Discover Brand",
      linkText: "Discover Brand",
      linkUrl: "/projects/4"
    },
    {
      id: 5,
      src: "images/5.jpg",
      alt: "Project 5",
      title: "Explore Design",
      linkText: "Explore Design",
      linkUrl: "/projects/5"
    },
    {
      id: 6,
      src: "images/6.jpg",
      alt: "Project 6",
      title: "View Portfolio",
      linkText: "View Portfolio",
      linkUrl: "/projects/6"
    }
  ];

  // Fungsi untuk menghitung waktu yang lalu
  const calculateTimeAgo = (date: Date | Timestamp): string => {
    const now = new Date();
    const commentDate = date instanceof Timestamp ? date.toDate() : date;
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} detik yang lalu`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari yang lalu`;
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

    updateTimes(); // Initial update
    const interval = setInterval(updateTimes, 1000); // Update setiap detik

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
        // Get display name (prioritize displayName, then email, then 'User')
        const name = currentUser.displayName || 
                     currentUser.email?.split('@')[0] || 
                     'User';
        setUserDisplayName(name);
        
        // Update user stats
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (chatbotPopupRef.current && !chatbotPopupRef.current.contains(event.target as Node)) {
        // Hanya tutup jika klik di luar popup
        const target = event.target as HTMLElement;
        // Periksa apakah klik bukan pada tombol navbar chatbot
        const isChatbotNavButton = target.closest('[data-nav-chatbot]');
        if (!isChatbotNavButton) {
          setShowChatbotPopup(false);
        }
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

  // Update posisi gambar ketika hoveredTopic berubah (semakin turun)
  useEffect(() => {
    if (hoveredTopic !== null) {
      // Hitung posisi berdasarkan index topic
      const topicIndex = indexTopics.findIndex(topic => topic.id === hoveredTopic);
      // Semakin besar index, semakin turun posisinya
      const newPosition = topicIndex * 40; // 40px per item
      setImagePosition(newPosition);
    } else {
      setImagePosition(0);
    }
  }, [hoveredTopic]);

  useEffect(() => {
    // Cek apakah user sudah menyetujui cookies
    const cookieAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookieAccepted) {
      setTimeout(() => {
        setShowCookieNotification(true);
      }, 2000);
    }

    // Tampilkan popup chatbot setelah loading selesai (jika belum pernah ditampilkan)
    const chatbotShown = localStorage.getItem('chatbotPopupShown');
    if (!chatbotShown) {
      setTimeout(() => {
        setShowChatbotPopup(true);
      }, 3000); // Tampilkan 3 detik setelah loading
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Animasi loading text
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentIndex]);
    }, 500);

    // Hentikan loading setelah selesai
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(textInterval);
    }, 3000);

    // Keyboard navigation
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
      // Kill ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile, showUserDropdown, showLogoutModal, showChatbotPopup]);

  // Fungsi untuk handle cookie acceptance
  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieNotification(false);
    
    // Set cookie untuk 30 hari
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = `cookiesAccepted=true; expires=${date.toUTCString()}; path=/`;
    
    // Simpan preferensi tema jika ada
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
    // Hentikan animasi sebelumnya
    if (progressAnimationRef.current) {
      progressAnimationRef.current.kill();
    }

    // Reset semua bar progress menjadi kosong
    const progressFills = document.querySelectorAll('.progress-fill');
    progressFills.forEach(fill => {
      (fill as HTMLElement).style.width = '0%';
    });

    // Mulai animasi untuk bar yang aktif
    const currentFill = document.querySelector(`.progress-fill[data-index="${currentPhotoIndex}"]`) as HTMLElement;
    
    if (currentFill) {
      progressAnimationRef.current = gsap.to(currentFill, {
        width: '100%',
        duration: 15, // SANGAT LAMBAT: 15 detik
        ease: "linear",
        onComplete: () => {
          // Setelah bar penuh, pindah ke foto berikutnya
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

  // Handler untuk Sign In / User Button
  const handleSignInClick = () => {
    if (user) {
      // Toggle dropdown
      setShowUserDropdown(!showUserDropdown);
    } else {
      // Jika belum login, redirect ke signin page
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

  // Handler untuk mengirim komentar ke Firebase - DIPERBAIKI
  const handleSendMessage = async () => {
    if (message.trim() === "") {
      alert("Komentar tidak boleh kosong");
      return;
    }
    
    try {
      const userName = user ? userDisplayName : "Anonymous";
      const userId = user ? user.uid : null;
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
      
      // Pastikan db sudah terinisialisasi
      if (!db) {
        throw new Error("Database tidak terinisialisasi");
      }
      
      // Simpan ke Firestore
      const docRef = await addDoc(collection(db, 'photoComments'), newComment);
      console.log("Komentar berhasil dikirim dengan ID:", docRef.id);
      
      // Reset form
      setMessage("");
      
      // Auto-focus kembali ke input
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
    // Simpan ke localStorage agar tidak muncul lagi
    localStorage.setItem('chatbotPopupShown', 'true');
  };

  // Handler untuk menuju ke halaman chatbot
  const handleGoToChatbot = () => {
    handleCloseChatbotPopup();
    router.push('/chatbot');
  };

  // Data untuk halaman Index - HANYA TAHUN
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

      {/* Teks "Selamat Tahun Baru 2026" di pojok kiri atas, di atas navbar */}
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
          marginTop: isMobile ? '2.5rem' : '3rem' // Memberi ruang untuk teks tahun baru
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
          top: isMobile ? '5rem' : '6rem', // Diperbarui untuk memberi ruang untuk navbar dan teks tahun baru
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
          {/* Teks "MENURU" */}
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
          {/* User Stats Badge - DIPERBAIKI */}
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
          gap: isMobile ? '0.1rem' : '0.2rem' // JARAK SANGAT DEKAT ANTAR BARIS
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
              {/* Container untuk Tombol Slider */}
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
              </div>

              {/* ======================== */}
              {/* 6 Foto Portrait Sejajar - DIUBAH */}
              {/* ======================== */}
              <div style={{
                width: '100%',
                padding: isMobile ? '1rem 1.5rem' : '2rem 3rem',
                marginTop: isMobile ? '2rem' : '3rem',
                marginBottom: isMobile ? '3rem' : '4rem',
                boxSizing: 'border-box'
              }}>
                {/* Judul "PROJECT" di atas foto */}
                <div style={{
                  marginBottom: isMobile ? '2rem' : '3rem',
                  textAlign: 'left',
                  paddingLeft: isMobile ? '1rem' : '2rem'
                }}>
                  <h2 style={{
                    color: 'white',
                    fontSize: isMobile ? '3rem' : '4rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '-1px',
                    margin: 0,
                    lineHeight: 1
                  }}>
                    PROJECT
                  </h2>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: isMobile ? '2rem' : '2rem',
                  maxWidth: '1400px',
                  margin: '0 auto'
                }}>
                  {portraitPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        height: '500px', // Tinggi tetap
                        position: 'relative'
                      }}
                      whileHover={{ 
                        y: -8,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(photo.linkUrl)}
                    >
                      {/* Container foto dengan tinggi penuh */}
                      <div style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <img 
                          src={photo.src} 
                          alt={photo.alt}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.5s ease'
                          }}
                        />
                        
                        {/* Overlay gelap transparan di atas foto */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0, 0, 0, 0.3)',
                          transition: 'background 0.3s ease'
                        }} />
                        
                        {/* Konten teks di tengah foto */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2rem',
                          textAlign: 'center',
                          zIndex: 2
                        }}>
                          {/* Tanda panah SVG di atas teks */}
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                              marginBottom: '1.5rem'
                            }}
                          >
                            <svg 
                              width="40" 
                              height="40" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="2"
                              style={{
                                opacity: 0.8
                              }}
                            >
                              <path d="M7 17L17 7" />
                              <path d="M7 7h10v10" />
                            </svg>
                          </motion.div>
                          
                          {/* Teks di tengah - hanya title yang muncul */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{
                              color: 'white',
                              fontSize: isMobile ? '1.8rem' : '2.2rem',
                              fontWeight: '600',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              letterSpacing: '0.5px',
                              textAlign: 'center',
                              maxWidth: '90%'
                            }}
                          >
                            {photo.title}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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

                  {/* Foto Portrait */}
                  <motion.div
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
      `}</style>
    </div>
  );
}
