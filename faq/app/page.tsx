'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
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
  type: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  recipientType: 'all' | 'specific' | 'email';
  recipientIds?: string[];
  recipientEmails?: string[];
  createdAt: Timestamp;
  userReads: Record<string, boolean>;
  views: number;
  likes: string[];
  comments: any[];
  status?: string;
  reactions?: Record<string, number>;
  links: {
    youtube: string[];
    pdf: string[];
    images: string[];
    videos: string[];
    websites: string[];
  };
  hasLinks: boolean;
  linkCount: number;
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

// Type untuk event kalender
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  color: string;
  label: string;
  createdBy: string;
  isAdmin: boolean;
}

// Type untuk data donasi user
interface UserDonation {
  id: string;
  eventId: string;
  eventTitle: string;
  amount: number;
  message: string;
  createdAt: Date;
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

  // State untuk notifikasi
  const [showNotification, setShowNotification] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [showNotificationAnimation, setShowNotificationAnimation] = useState(false);
  const [newNotificationText, setNewNotificationText] = useState("");

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

// State untuk GSAP Loading
const [showGsapLoading, setShowGsapLoading] = useState(true);
const [currentWordIndex, setCurrentWordIndex] = useState(0);

// State untuk MENURU Overlay setelah loading
const [showMenuruOverlay, setShowMenuruOverlay] = useState(true);
const [hasScrolled, setHasScrolled] = useState(false);

  // State untuk kalender
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // State untuk Note Overlay
  const [showNoteOverlay, setShowNoteOverlay] = useState(false);

  // State untuk Community Overlay
  const [showCommunityOverlay, setShowCommunityOverlay] = useState(false);

  // State untuk overlay halaman
  const [showProductOverlay, setShowProductOverlay] = useState(false);
  const [showVisualDesignerOverlay, setShowVisualDesignerOverlay] = useState(false);
  const [showIndonesiaOverlay, setShowIndonesiaOverlay] = useState(false);

  // State untuk Donasi Tracking
  const [showDonasiTracking, setShowDonasiTracking] = useState(false);
  const [userDonations, setUserDonations] = useState<UserDonation[]>([]);
  const [totalDonasiUser, setTotalDonasiUser] = useState(0);
  const [isLoadingDonations, setIsLoadingDonations] = useState(false);

  // State untuk rotating words
  const [currentRotatingWordIndex, setCurrentRotatingWordIndex] = useState(0);
  const rotatingWordsList = ["Community", "Catatan", "Blog"];

  // Data untuk Community Items - Dibagi 2 kolom
  const communityItemsLeft = [
    { id: 1, name: "Point Blank" },
    { id: 2, name: "Lost Saga" },
    { id: 3, name: "Persib" }
  ];

  const communityItemsRight = [
    { id: 4, name: "Coding" },
    { id: 5, name: "Pembersihan" },
    { id: 6, name: "Pendidikan" }
  ];

  // Data deskripsi untuk setiap bagian di halaman utama
  const sectionDescriptions = {
    docs: {
      title: "Dokumentasi",
      description: "Panduan lengkap penggunaan platform MENURU, termasuk fitur-fitur, tutorial, dan best practices untuk memaksimalkan pengalaman Anda.",
      features: ["API Reference", "User Guide", "Integration", "Examples"]
    },
    update: {
      title: "Update",
      description: "Informasi terbaru tentang pengembangan platform, rilis fitur baru, perbaikan bug, dan roadmap pengembangan MENURU ke depan.",
      features: ["Version History", "New Features", "Bug Fixes", "Roadmap"]
    },
    timeline: {
      title: "Timeline",
      description: "Linimasa aktivitas dan perkembangan proyek MENURU, mencatat perjalanan dari awal hingga sekarang dalam bentuk kronologis.",
      features: ["Project History", "Milestones", "Achievements", "Future Plans"]
    },
    chatbot: {
      title: "Chatbot AI",
      description: "Asisten AI cerdas yang siap membantu menjawab pertanyaan, memberikan saran, dan membantu navigasi platform MENURU.",
      features: ["24/7 Availability", "Smart Responses", "Context Aware", "Multi-language"]
    },
    community: {
      title: "Community",
      description: "Ruang bagi pengguna MENURU untuk berinteraksi, berbagi ide, berdiskusi, dan membangun koneksi dengan sesama kreator.",
      features: ["Forums", "Events", "Members", "Collaboration"]
    },
    news: {
      title: "News",
      description: "Berita dan pengumuman terbaru seputar MENURU, termasuk update platform, acara komunitas, dan kolaborasi menarik.",
      features: ["Announcements", "Events", "Partnerships", "Media Coverage"]
    },
    stories: {
      title: "Stories",
      description: "Kumpulan cerita inspiratif dari pengguna MENURU, perjalanan kreatif mereka, dan bagaimana platform membantu mewujudkan ide.",
      features: ["User Stories", "Success Stories", "Creative Journey", "Testimonials"]
    },
    note: {
      title: "Note",
      description: "Fitur catatan pribadi untuk merekam ide, pemikiran, dan inspirasi. Organisasikan catatan Anda dalam berbagai kategori.",
      features: ["Personal Notes", "Collaborative Notes", "Categories", "Search & Filter"]
    },
    calendar: {
      title: "Calendar",
      description: "Kalender kegiatan yang menampilkan jadwal acara, deadline, dan event penting seputar MENURU dan komunitas.",
      features: ["Events Schedule", "Deadlines", "Workshops", "Reminders"]
    }
  };

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
  
  // Ref untuk notifikasi
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const notificationBellRef = useRef<HTMLDivElement>(null);
  const notificationTextRef = useRef<HTMLSpanElement>(null);
  const userProfileModalRef = useRef<HTMLDivElement>(null);

  // Ref untuk GSAP Loading
  const gsapLoadingRef = useRef<HTMLDivElement>(null);
  const loadingTextRef = useRef<HTMLSpanElement>(null);

  // Ref untuk modal kalender
  const calendarModalRef = useRef<HTMLDivElement>(null);

  // Ref untuk Note Overlay
  const noteOverlayRef = useRef<HTMLDivElement>(null);

  // Ref untuk Community Overlay
  const communityOverlayRef = useRef<HTMLDivElement>(null);

  // Ref untuk overlay product, visual designer, indonesia
  const productOverlayRef = useRef<HTMLDivElement>(null);
  const visualDesignerOverlayRef = useRef<HTMLDivElement>(null);
  const indonesiaOverlayRef = useRef<HTMLDivElement>(null);

  // Ref untuk tombol close
  const visualDesignerCloseRef = useRef<HTMLDivElement>(null);
  const indonesiaCloseRef = useRef<HTMLDivElement>(null);

  const [openSection, setOpenSection] = useState<string | null>(null);

  // Fungsi untuk toggle section
  const handleToggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // State untuk Spotify
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>('');

  // Data untuk rotating words
  const rotatingWords = ["build", "design", "create"];

  // Data playlist lagu kesukaan
  const favoriteTracks = [
    {
      id: 'hanin1',
      title: 'Pupus',
      artist: 'Hanin Dhiya',
      embedUrl: 'https://open.spotify.com/embed/track/4za8UJq7JI99ilRYQXVrkm?utm_source=generator',
      spotifyUrl: 'https://open.spotify.com/track/4za8UJq7JI99ilRYQXVrkm?si=e767fcf3e9ae4a6c'
    },
    {
      id: 'hanin2',
      title: 'Suatu Saat Nanti',
      artist: 'Hanin Dhiya',
      embedUrl: 'https://open.spotify.com/embed/track/11nApQrr7tfBNYzBOmHWCc?utm_source=generator',
      spotifyUrl: 'https://open.spotify.com/track/11nApQrr7tfBNYzBOmHWCc?si=a141c85a054d41b0'
    },
    {
      id: 'sha1',
      title: 'Kita Lawan Mereka',
      artist: 'Stand Here Alone',
      embedUrl: 'https://open.spotify.com/embed/track/2rj9nnNMZQNs2pZAPWuvze?utm_source=generator',
      spotifyUrl: 'https://open.spotify.com/track/2rj9nnNMZQNs2pZAPWuvze?si=34b6e33a87454394'
    },
    {
      id: 'sha2',
      title: 'Korban Lelaki',
      artist: 'Stand Here Alone',
      embedUrl: 'https://open.spotify.com/embed/track/3u53sM4xrdWl0uDLzcFm6x?utm_source=generator',
      spotifyUrl: 'https://open.spotify.com/track/3u53sM4xrdWl0uDLzcFm6x?si=ba3bbf39522a475e'
    },
    {
      id: 'sha3',
      title: 'Wanita Masih Banyak',
      artist: 'Stand Here Alone',
      embedUrl: 'https://open.spotify.com/embed/track/5H60BCrbWBocSIAoZwjxwD?utm_source=generator',
      spotifyUrl: 'https://open.spotify.com/track/5H60BCrbWBocSIAoZwjxwD?si=2ac532c98a9b483e'
    }
  ];

  // Fungsi untuk memutar lagu
  const playTrack = (track: typeof favoriteTracks[0]) => {
    setCurrentTrack(track.id);
    setCurrentEmbedUrl(track.embedUrl);
    setIsPlaying(true);
  };

  const [jakartaTime, setJakartaTime] = useState<string>('');

  // useEffect untuk update jam Jakarta setiap detik
  useEffect(() => {
    const updateJakartaTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('id-ID', { 
        timeZone: 'Asia/Jakarta', 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setJakartaTime(timeString);
    };

    updateJakartaTime();
    const interval = setInterval(updateJakartaTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animasi rotating words GSAP
  useEffect(() => {
    if (!showGsapLoading) {
      const interval = setInterval(() => {
        setCurrentRotatingWordIndex((prev) => (prev + 1) % rotatingWordsList.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [showGsapLoading]);

  // Data untuk pencarian
  const searchablePages = [
    { id: 1, title: "Chatbot AI", description: "AI Assistant dengan teknologi terbaru", category: "Tools", url: "/chatbot", icon: "🤖" },
    { id: 2, title: "Sign In", description: "Masuk ke akun Anda", category: "Authentication", url: "/signin", icon: "🔐" },
    { id: 3, title: "Sign Up", description: "Buat akun baru", category: "Authentication", url: "/signup", icon: "👤" },
    { id: 4, title: "Notifikasi", description: "Lihat semua notifikasi", category: "System", url: "/notifications", icon: "🔔" },
    { id: 5, title: "Dokumentasi", description: "Baca dokumentasi lengkap", category: "Resources", url: "/docs", icon: "📚" },
    { id: 6, title: "Update", description: "Pembaruan terbaru", category: "News", url: "/update", icon: "🆕" },
    { id: 7, title: "Timeline", description: "Linimasa aktivitas", category: "Features", url: "/timeline", icon: "📅" },
    { id: 8, title: "Catatan", description: "Catatan pribadi Anda", category: "Personal", url: "/notes", icon: "📝" },
    { id: 9, title: "Calendar", description: "Lihat kalender kegiatan admin", category: "Features", url: "/calendar", icon: "🗓️" }
  ];

  // Animasi loading text
  const loadingTexts = [
    "NURU", "MBACA", "NULIS", "NGEXPLORASI", 
    "NEMUKAN", "NCIPTA", "NGGALI", "NARIK",
    "NGAMATI", "NANCANG", "NGEMBANGKAN", "NYUSUN"
  ];

  // Data foto untuk progress bar
  const progressPhotos = [
    { id: 1, src: "images/5.jpg", alt: "Photo 1", uploadTime: new Date(Date.now() - 5 * 60 * 1000) },
    { id: 2, src: "images/6.jpg", alt: "Photo 2", uploadTime: new Date(Date.now() - 2 * 60 * 1000) },
    { id: 3, src: "images/5.jpg", alt: "Photo 3", uploadTime: new Date(Date.now() - 30 * 1000) }
  ];

  // Data untuk Roles
  const rolesData = [
    { title: "My Roles", description: "Branding & Creative Direction" },
    { title: "Design", description: "Visual identity & UI/UX" },
    { title: "Development", description: "Frontend & Backend" },
    { title: "Features", description: "Functionality & Integration" }
  ];

  // Data untuk halaman Index
  const indexTopics = [
    { id: 1, title: "Personal Journey", description: "Exploring self-discovery.", year: "2024" },
    { id: 2, title: "Creative Process", description: "Ideas evolution documentation.", year: "2024" },
    { id: 3, title: "Visual Storytelling", description: "Photography for personal growth.", year: "2024" },
    { id: 4, title: "Emotional Archive", description: "Collection of feelings.", year: "2024" },
    { id: 5, title: "Growth Metrics", description: "Tracking development goals.", year: "2024" }
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

  const calculateTimeAgo = (date: Date | Timestamp | undefined | null): string => {
    try {
      if (!date) return "Recently";
      
      const now = new Date();
      let commentDate: Date;
      
      if (date instanceof Timestamp) {
        commentDate = date.toDate();
      } else if (date instanceof Date) {
        commentDate = date;
      } else {
        commentDate = new Date(date);
      }
      
      if (!commentDate || isNaN(commentDate.getTime())) return "Recently";
      
      const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    } catch (error) {
      return "Recently";
    }
  };

  // Fungsi format waktu untuk donasi
  const formatTime = (date: any): string => {
    if (!date) return "Baru saja";
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return "Baru saja";
      
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return d.toLocaleDateString('id-ID');
    } catch {
      return "Baru saja";
    }
  };

  // Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fungsi untuk mendapatkan nama bulan
  const getMonthName = (monthIndex: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthIndex];
  };

  // Fungsi untuk mendapatkan hari dalam seminggu
  const getDayName = (dayIndex: number): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex];
  };

  // Fungsi untuk mendapatkan jumlah hari dalam bulan
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Fungsi untuk mendapatkan hari pertama dalam bulan
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(currentYear, currentMonth, i);
      const dayEvents = calendarEvents.filter(event => {
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
        return (
          eventDate.getDate() === i &&
          eventDate.getMonth() === currentMonth &&
          eventDate.getFullYear() === currentYear
        );
      });
      days.push({
        date: i,
        fullDate: currentDate,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
    }
    return days;
  };

  // Fungsi untuk navigasi bulan
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Fungsi untuk pilih tahun
  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
  };

  // Fungsi untuk pilih bulan
  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
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

  // Load user donations dari Firebase
  const loadUserDonations = async (userId: string) => {
    if (!db || !userId) return;
    try {
      setIsLoadingDonations(true);
      const donationsRef = collection(db, 'donationEvents');
      const querySnapshot = await getDocs(donationsRef);
      const donationsData: UserDonation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const donors = data.donors || [];
        const userDonationsInEvent = donors.filter((d: any) => d.userId === userId);
        userDonationsInEvent.forEach((donation: any) => {
          donationsData.push({
            id: donation.id,
            eventId: doc.id,
            eventTitle: data.title,
            amount: donation.amount,
            message: donation.message,
            createdAt: donation.createdAt?.toDate ? donation.createdAt.toDate() : new Date(donation.createdAt)
          });
        });
      });
      donationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setUserDonations(donationsData);
      const total = donationsData.reduce((sum, d) => sum + d.amount, 0);
      setTotalDonasiUser(total);
      setIsLoadingDonations(false);
    } catch (error) {
      console.error("Error loading user donations:", error);
      setIsLoadingDonations(false);
    }
  };

  // Real-time listener untuk donasi user
  const loadUserDonationsRealtime = (userId: string) => {
    if (!db || !userId) return () => {};
    try {
      const donationsRef = collection(db, 'donationEvents');
      const unsubscribe = onSnapshot(donationsRef, (querySnapshot) => {
        const donationsData: UserDonation[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const donors = data.donors || [];
          const userDonationsInEvent = donors.filter((d: any) => d.userId === userId);
          userDonationsInEvent.forEach((donation: any) => {
            donationsData.push({
              id: donation.id,
              eventId: doc.id,
              eventTitle: data.title,
              amount: donation.amount,
              message: donation.message,
              createdAt: donation.createdAt?.toDate ? donation.createdAt.toDate() : new Date(donation.createdAt)
            });
          });
        });
        donationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setUserDonations(donationsData);
        const total = donationsData.reduce((sum, d) => sum + d.amount, 0);
        setTotalDonasiUser(total);
        setIsLoadingDonations(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up realtime donations:", error);
      return () => {};
    }
  };

  // Fungsi untuk load user notes dari Firebase
  const loadUserNotes = async (userId: string) => {
    if (!db || !userId) return;
    try {
      setIsLoadingNotes(true);
      const notesRef = collection(db, 'userNotes');
      const q = query(notesRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const notesData: Note[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const noteTitle = data.title?.trim() || 'Untitled Note';
        const noteDescription = data.description?.trim() || data.content?.trim() || '';
        const noteCategory = data.category?.trim() || '';
        const noteLink = data.link?.trim() || '';
        notesData.push({
          id: doc.id,
          title: noteTitle,
          content: noteDescription,
          userId: data.userId || userId,
          userName: data.userName || userDisplayName || 'User',
          userEmail: data.userEmail || user?.email || '',
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
          isPinned: data.isPinned || false,
          category: noteCategory,
          link: noteLink,
          color: data.color || '#3B82F6',
          tags: data.tags || []
        });
      });
      setUserNotes(notesData);
      setTotalNotesCount(notesData.length);
      setIsLoadingNotes(false);
    } catch (error) {
      console.error("Error loading user notes:", error);
      setIsLoadingNotes(false);
    }
  };

  // Fungsi untuk load user notes secara real-time
  const loadUserNotesRealtime = (userId: string) => {
    if (!db || !userId) return () => {};
    try {
      const notesRef = collection(db, 'userNotes');
      const q = query(notesRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notesData: Note[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const noteTitle = data.title?.trim() || 'Untitled Note';
          const noteDescription = data.description?.trim() || data.content?.trim() || '';
          const noteCategory = data.category?.trim() || '';
          const noteLink = data.link?.trim() || '';
          notesData.push({
            id: doc.id,
            title: noteTitle,
            content: noteDescription,
            userId: data.userId || userId,
            userName: data.userName || userDisplayName || 'User',
            userEmail: data.userEmail || user?.email || '',
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date(),
            isPinned: data.isPinned || false,
            category: noteCategory,
            link: noteLink,
            color: data.color || '#3B82F6',
            tags: data.tags || []
          });
        });
        setUserNotes(notesData);
        setTotalNotesCount(notesData.length);
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
        case 'password': return 'Email/Password';
        case 'google.com': return 'Google';
        case 'github.com': return 'GitHub';
        default: return providerId;
      }
    }
    return 'Email/Password';
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
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

  // Real-time listener untuk donasi user ketika modal tracking terbuka
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (showDonasiTracking && user) {
      loadUserDonations(user.uid);
      unsubscribe = loadUserDonationsRealtime(user.uid);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [showDonasiTracking, user]);

  // Load comments from Firebase
  useEffect(() => {
    setIsLoadingComments(true);
    const commentsRef = collection(db, 'photoComments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData: Comment[] = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({
          id: doc.id,
          ...doc.data()
        } as Comment);
      });
      setComments(commentsData);
      setIsLoadingComments(false);
    }, (error) => {
      console.error("Error loading comments:", error);
      setIsLoadingComments(false);
    });
    return () => unsubscribe();
  }, []);

  // Load notifications from Firebase
  useEffect(() => {
    if (!db) {
      setIsLoadingNotifications(false);
      return;
    }
    setIsLoadingNotifications(true);
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
          setNotifications([]);
          setHasUnreadNotifications(false);
          setPreviousNotificationCount(notificationCount);
          setNotificationCount(0);
          setIsLoadingNotifications(false);
          return;
        }
        const notificationsData: Notification[] = [];
        let unreadCount = 0;
        let newNotificationsCount = 0;
        const currentUser = auth?.currentUser;
        const currentUserId = currentUser ? currentUser.uid : localStorage.getItem('anonymous_user_id') || 'anonymous_' + Date.now();
        if (!currentUser && !localStorage.getItem('anonymous_user_id')) {
          localStorage.setItem('anonymous_user_id', currentUserId);
        }
        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            if (data.isDeleted === true) return;
            let shouldShow = false;
            switch (data.recipientType) {
              case 'all': shouldShow = true; break;
              case 'specific':
                const recipientIds = data.recipientIds || [];
                if (recipientIds.includes(currentUserId) || (currentUser && recipientIds.includes(currentUser.uid))) shouldShow = true;
                break;
              case 'email':
                if (currentUser && data.recipientEmails?.includes(currentUser.email)) shouldShow = true;
                break;
              default: shouldShow = false;
            }
            if (shouldShow) {
              let timestamp = data.createdAt;
              if (timestamp && typeof timestamp.toDate === 'function') {
                timestamp = timestamp.toDate();
              }
              const linksData = data.links || {};
              const notification: Notification = {
                id: doc.id,
                title: data.title || '',
                message: data.message || '',
                type: data.type || 'info',
                senderId: data.senderId || '',
                senderName: data.senderName || 'System',
                senderEmail: data.senderEmail,
                recipientType: data.recipientType || 'all',
                recipientIds: data.recipientIds || [],
                recipientEmails: data.recipientEmails || [],
                createdAt: timestamp || Timestamp.now(),
                userReads: data.userReads || {},
                views: data.views || 0,
                likes: data.likes || [],
                comments: data.comments || [],
                status: data.status || 'sent',
                reactions: data.reactions || {},
                links: {
                  youtube: Array.isArray(linksData.youtube) ? linksData.youtube : [],
                  pdf: Array.isArray(linksData.pdf) ? linksData.pdf : [],
                  images: Array.isArray(linksData.images) ? linksData.images : [],
                  videos: Array.isArray(linksData.videos) ? linksData.videos : [],
                  websites: Array.isArray(linksData.websites) ? linksData.websites : []
                },
                hasLinks: data.hasLinks === true || (linksData && Object.values(linksData).some(arr => arr && arr.length > 0)),
                linkCount: data.linkCount || 0
              };
              const isReadByUser = notification.userReads[currentUserId] || (currentUser && notification.userReads[currentUser.uid]) || false;
              if (!isReadByUser) {
                unreadCount++;
                if (notification.createdAt) {
                  const now = new Date();
                  const notifDate = notification.createdAt instanceof Timestamp ? notification.createdAt.toDate() : new Date(notification.createdAt);
                  const diffMinutes = (now.getTime() - notifDate.getTime()) / (1000 * 60);
                  if (diffMinutes < 5) newNotificationsCount++;
                }
              }
              notificationsData.push(notification);
            }
          } catch (error) {
            console.error(`❌ Error processing notification ${doc.id}:`, error);
          }
        });
        setPreviousNotificationCount(notificationCount);
        if (newNotificationsCount > 0) {
          setNewNotificationText(`${newNotificationsCount} notifikasi baru`);
          setShowNotificationAnimation(true);
          setTimeout(() => {
            setShowNotificationAnimation(false);
          }, 3000);
        }
        setNotifications(notificationsData);
        setHasUnreadNotifications(unreadCount > 0);
        setNotificationCount(unreadCount);
        setIsLoadingNotifications(false);
      }, (error) => {
        console.error("❌ Error loading notifications:", error);
        setIsLoadingNotifications(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("❌ Error in notifications useEffect:", error);
      setIsLoadingNotifications(false);
    }
  }, [db, auth?.currentUser]);

  // Load events kalender dari Firebase
  useEffect(() => {
    if (showCalendarModal && db) {
      setIsLoadingEvents(true);
      try {
        const eventsRef = collection(db, 'calendarEvents');
        const q = query(eventsRef, orderBy('date', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const eventsData: CalendarEvent[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            let eventDate = data.date;
            if (eventDate && typeof eventDate.toDate === 'function') {
              eventDate = eventDate.toDate();
            } else if (typeof eventDate === 'string') {
              eventDate = new Date(eventDate);
            }
            eventsData.push({
              id: doc.id,
              title: data.title || "No Title",
              description: data.description || "",
              date: eventDate,
              color: data.color || "#3B82F6",
              label: data.label || "Event",
              createdBy: data.createdBy || "Unknown",
              isAdmin: data.isAdmin || false
            });
          });
          setCalendarEvents(eventsData);
          setIsLoadingEvents(false);
        }, (error) => {
          console.error("❌ Error loading calendar events:", error);
          setIsLoadingEvents(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("❌ Error setting up calendar listener:", error);
        setIsLoadingEvents(false);
      }
    }
  }, [showCalendarModal, db]);

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
          onReverseComplete: () => setScrollDirection("right"),
          onComplete: () => setScrollDirection("left")
        });
        return () => animation.kill();
      } else {
        setIsNameScrolling(false);
      }
    }
  }, [user, userDisplayName, isMobile]);

  // Mouse wheel scroll handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!showUserProfileModal && !showMenuruFullPage && !showPhotoFullPage && !showCalendarModal && !showNoteOverlay && !showCommunityOverlay && !showProductOverlay && !showVisualDesignerOverlay && !showIndonesiaOverlay && !showDonasiTracking) {
        return;
      }
      e.stopPropagation();
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) e.preventDefault();
    };
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [showUserProfileModal, showMenuruFullPage, showPhotoFullPage, showCalendarModal, showNoteOverlay, showCommunityOverlay, showProductOverlay, showVisualDesignerOverlay, showIndonesiaOverlay, showDonasiTracking]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) setShowUserDropdown(false);
      if (menuOverlayRef.current && !menuOverlayRef.current.contains(event.target as Node)) handleCloseMenu();
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) setShowNotification(false);
      if (userProfileModalRef.current && !userProfileModalRef.current.contains(event.target as Node)) setShowUserProfileModal(false);
      if (calendarModalRef.current && !calendarModalRef.current.contains(event.target as Node)) {
        setShowCalendarModal(false);
        setSelectedDate(null);
      }
      if (noteOverlayRef.current && !noteOverlayRef.current.contains(event.target as Node)) setShowNoteOverlay(false);
      if (communityOverlayRef.current && !communityOverlayRef.current.contains(event.target as Node)) setShowCommunityOverlay(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
          );
        }
      });
    } else {
      setLeftCounter(newLeftCounter);
    }
  };

  useEffect(() => {
    updateLeftCounter(currentPhotoIndex);
  }, [currentPhotoIndex]);

  useEffect(() => {
    if (hoveredTopic !== null) {
      const topicIndex = indexTopics.findIndex(topic => topic.id === hoveredTopic);
      setImagePosition(topicIndex * 40);
    } else {
      setImagePosition(0);
    }
  }, [hoveredTopic]);

  // Handler untuk membuka menu overlay
  const handleOpenMenu = () => setShowMenuOverlay(true);

  // Handler untuk menutup menu overlay
  const handleCloseMenu = () => {
    if (menuOverlayRef.current) {
      const tl = gsap.timeline();
      tl.to(menuOverlayRef.current, {
        y: '-100%',
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => setShowMenuOverlay(false)
      });
    } else {
      setShowMenuOverlay(false);
    }
  };

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

  // Handler untuk Note Overlay
  const handleNoteClick = () => setShowNoteOverlay(true);
  const handleCloseNoteOverlay = () => setShowNoteOverlay(false);

  // Handler untuk Community Overlay
  const handleCommunityClick = () => {
    setShowCommunityOverlay(true);
  };

  const handleCloseCommunityOverlay = () => setShowCommunityOverlay(false);

  // Handler untuk News dan Stories
  const handleNewsClick = () => {
    router.push('/news');
  };

  const handleStoriesClick = () => {
    router.push('/stories');
  };

  // Handler untuk membuka overlay product, visual designer, indonesia
  const handleProductClick = () => setShowProductOverlay(true);
  const handleVisualDesignerClick = () => setShowVisualDesignerOverlay(true);
  const handleIndonesiaClick = () => setShowIndonesiaOverlay(true);

  // Handler untuk membuka Donasi Tracking
  const handleDonasiTrackingClick = () => {
    if (user) {
      setShowDonasiTracking(true);
      loadUserDonations(user.uid);
    } else {
      router.push('/signin');
    }
  };
  const handleCloseDonasiTracking = () => setShowDonasiTracking(false);

  // Handler untuk navigasi ke halaman donasi (/donatur)
  const handleDonasiPageClick = () => {
    router.push('/donatur');
  };

  // Handler untuk menutup overlay
  const handleCloseProductOverlay = () => setShowProductOverlay(false);
  const handleCloseVisualDesignerOverlay = () => setShowVisualDesignerOverlay(false);
  const handleCloseIndonesiaOverlay = () => setShowIndonesiaOverlay(false);

  // Animasi GSAP untuk tombol close Visual Designer
  useEffect(() => {
    if (showVisualDesignerOverlay && visualDesignerCloseRef.current) {
      gsap.fromTo(visualDesignerCloseRef.current,
        { 
          opacity: 0, 
          scale: 0.5,
          rotation: -180
        },
        { 
          opacity: 1, 
          scale: 1, 
          rotation: 0,
          duration: 0.8, 
          delay: 0.3, 
          ease: "power3.out" 
        }
      );
      
      const hoverIn = () => {
        gsap.to(visualDesignerCloseRef.current, {
          scale: 1.2,
          rotation: 90,
          duration: 0.3,
          ease: "power2.out"
        });
      };
      
      const hoverOut = () => {
        gsap.to(visualDesignerCloseRef.current, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      };
      
      visualDesignerCloseRef.current.addEventListener('mouseenter', hoverIn);
      visualDesignerCloseRef.current.addEventListener('mouseleave', hoverOut);
      
      return () => {
        if (visualDesignerCloseRef.current) {
          visualDesignerCloseRef.current.removeEventListener('mouseenter', hoverIn);
          visualDesignerCloseRef.current.removeEventListener('mouseleave', hoverOut);
        }
      };
    }
  }, [showVisualDesignerOverlay]);

  // Animasi GSAP untuk tombol close Indonesia
  useEffect(() => {
    if (showIndonesiaOverlay && indonesiaCloseRef.current) {
      gsap.fromTo(indonesiaCloseRef.current,
        { 
          opacity: 0, 
          scale: 0.5,
          rotation: -180
        },
        { 
          opacity: 1, 
          scale: 1, 
          rotation: 0,
          duration: 0.8, 
          delay: 0.3, 
          ease: "power3.out" 
        }
      );
      
      const hoverIn = () => {
        gsap.to(indonesiaCloseRef.current, {
          scale: 1.2,
          rotation: 90,
          duration: 0.3,
          ease: "power2.out"
        });
      };
      
      const hoverOut = () => {
        gsap.to(indonesiaCloseRef.current, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      };
      
      indonesiaCloseRef.current.addEventListener('mouseenter', hoverIn);
      indonesiaCloseRef.current.addEventListener('mouseleave', hoverOut);
      
      return () => {
        if (indonesiaCloseRef.current) {
          indonesiaCloseRef.current.removeEventListener('mouseenter', hoverIn);
          indonesiaCloseRef.current.removeEventListener('mouseleave', hoverOut);
        }
      };
    }
  }, [showIndonesiaOverlay]);


// Animasi GSAP Loading
useEffect(() => {
  if (!loadingTextRef.current) return;
  const loadingTimeline = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.2,
    onReverseComplete: () => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }
  });
  loadingTimeline
    .to(loadingTextRef.current, { opacity: 0, y: -5, duration: 0.3, ease: "power1.in" })
    .to({}, { duration: 0.1 })
    .set(loadingTextRef.current, {
      onComplete: () => {
        setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
      }
    })
    .to(loadingTextRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "power1.out" });
  const timeout = setTimeout(() => {
    gsap.to(gsapLoadingRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        setShowGsapLoading(false);
        // Setelah loading selesai, tampilkan MENURU overlay
        setShowMenuruOverlay(true);
      }
    });
    loadingTimeline.kill();
  }, 3000);
  return () => {
    loadingTimeline.kill();
    clearTimeout(timeout);
  };
}, []);

// Scroll handler untuk MENURU overlay - SMOOTH TRANSITION (tanpa design tambahan)
useEffect(() => {
  if (!showMenuruOverlay) return;

  let lenis: Lenis | null = null;
  let animationFrame: number;
  let isAnimating = false;

  // Inisialisasi Lenis untuk smooth scroll
  if (typeof window !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis?.raf(time);
      animationFrame = requestAnimationFrame(raf);
    }
    animationFrame = requestAnimationFrame(raf);
  }

  // Handler untuk wheel - LANGSUNG HILANGKAN OVERLAY
  const handleWheel = (e: WheelEvent) => {
    // Cek apakah scroll ke bawah dan belum dalam animasi
    if (e.deltaY > 0 && !isAnimating) {
      e.preventDefault();
      isAnimating = true;
      
      const overlay = document.getElementById('menuru-overlay');
      
      if (overlay) {
        // Animasi fade out untuk overlay
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            // Langsung hilangkan overlay
            setShowMenuruOverlay(false);
            setHasScrolled(true);
            
            // Reset scroll ke atas
            if (lenis) {
              lenis.scrollTo(0, { immediate: true });
            } else {
              window.scrollTo(0, 0);
            }
            
            isAnimating = false;
          }
        });
      } else {
        setShowMenuruOverlay(false);
        setHasScrolled(true);
        if (lenis) lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
        isAnimating = false;
      }
    }
  };

  // Untuk touch device (mobile)
  let touchStartY = 0;
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    
    // Swipe ke bawah (deltaY negatif)
    if (deltaY < -30 && !isAnimating) {
      e.preventDefault();
      isAnimating = true;
      
      const overlay = document.getElementById('menuru-overlay');
      
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            setShowMenuruOverlay(false);
            setHasScrolled(true);
            if (lenis) lenis.scrollTo(0, { immediate: true });
            else window.scrollTo(0, 0);
            isAnimating = false;
          }
        });
      } else {
        setShowMenuruOverlay(false);
        setHasScrolled(true);
        if (lenis) lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
        isAnimating = false;
      }
    }
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', handleTouchStart);
  window.addEventListener('touchend', handleTouchEnd);

  return () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (lenis) lenis.destroy();
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchend', handleTouchEnd);
  };
}, [showMenuruOverlay]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
        if (e.key === 'ArrowLeft') prevPhoto();
        else if (e.key === 'ArrowRight') nextPhoto();
      }
      if (e.key === 'Escape') {
        if (showMenuruFullPage) handleCloseMenuruFullPage();
        if (showPhotoFullPage) handleClosePhotoFullPage();
        if (showUserDropdown) setShowUserDropdown(false);
        if (showLogoutModal) setShowLogoutModal(false);
        if (showMenuOverlay) handleCloseMenu();
        if (showNotification) setShowNotification(false);
        if (showUserProfileModal) setShowUserProfileModal(false);
        if (showDeleteAccountModal) setShowDeleteAccountModal(false);
        if (showCalendarModal) {
          setShowCalendarModal(false);
          setSelectedDate(null);
        }
        if (showNoteOverlay) setShowNoteOverlay(false);
        if (showCommunityOverlay) setShowCommunityOverlay(false);
        if (showProductOverlay) setShowProductOverlay(false);
        if (showVisualDesignerOverlay) setShowVisualDesignerOverlay(false);
        if (showIndonesiaOverlay) setShowIndonesiaOverlay(false);
        if (showDonasiTracking) setShowDonasiTracking(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(textInterval);
      clearTimeout(loadingTimeout);
      document.removeEventListener('keydown', handleKeyDown);
      if (progressAnimationRef.current) progressAnimationRef.current.kill();
      if (plusSignRef.current) gsap.killTweensOf(plusSignRef.current);
      if (backslashRef.current) gsap.killTweensOf(backslashRef.current);
      if (leftCounterRef.current) gsap.killTweensOf(leftCounterRef.current);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile, showMenuruFullPage, showPhotoFullPage, showUserDropdown, showLogoutModal, showMenuOverlay, showNotification, showUserProfileModal, showDeleteAccountModal, showCalendarModal, showNoteOverlay, showCommunityOverlay, showProductOverlay, showVisualDesignerOverlay, showIndonesiaOverlay, showDonasiTracking]);

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
      document.cookie = `themePreference=${localStorage.getItem('themePreference')}; expires=${date.toUTCString()}; path=/`;
    }
  };

  // Fungsi untuk maju ke foto berikutnya
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % progressPhotos.length);
  };

  // Fungsi untuk mundur ke foto sebelumnya
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + progressPhotos.length) % progressPhotos.length);
  };

  // Start progress animation
  const startProgressAnimation = () => {
    if (progressAnimationRef.current) progressAnimationRef.current.kill();
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
          if (isProgressActive) nextPhoto();
        }
      });
    }
  };

  useEffect(() => {
    if (isProgressActive) startProgressAnimation();
  }, [currentPhotoIndex, isProgressActive]);

  // Handler untuk topic hover
  const handleTopicHover = (topicId: number | null) => setHoveredTopic(topicId);

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
  const toggleMenuruFullPage = () => setShowMenuruFullPage(!showMenuruFullPage);
  const handleMenuruClick = () => toggleMenuruFullPage();
  const handleCloseMenuruFullPage = () => setShowMenuruFullPage(false);

  // Handler untuk membuka tampilan foto full page
  const handleOpenPhotoFullPage = () => setShowPhotoFullPage(true);
  const handleClosePhotoFullPage = () => setShowPhotoFullPage(false);
  const handlePhotoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenPhotoFullPage();
  };

  // Handler untuk Sign In / User Button
  const handleSignInClick = () => {
    if (user) {
      setShowUserProfileModal(true);
      if (user) loadUserNotes(user.uid);
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
  const handleCancelLogout = () => setShowLogoutModal(false);

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
      if (messageInputRef.current) messageInputRef.current.focus();
    } catch (error: any) {
      console.error("Error detail:", error);
      let errorMessage = "Gagal mengirim komentar. Silakan coba lagi.";
      if (error.code === 'permission-denied') errorMessage = "Anda tidak memiliki izin untuk mengirim komentar. Periksa Firebase Rules.";
      else if (error.code === 'unauthenticated') errorMessage = "Silakan login terlebih dahulu untuk mengirim komentar.";
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

  // Handler untuk update profile
  const handleUpdateProfile = async () => {
    if (!user || !auth.currentUser) return;
    try {
      setIsUpdating(true);
      if (editName !== userDisplayName) {
        await updateProfile(auth.currentUser, { displayName: editName });
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
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => batch.delete(doc.ref));
      const userStatsRef = doc(db, 'userStats', user.uid);
      batch.delete(userStatsRef);
      await batch.commit();
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
    if (feedback && feedback.trim() !== '') alert("Terima kasih atas feedback Anda!");
  };

  // Handler untuk clear notification
  const handleClearNotification = () => {
    console.log("Clear all notifications");
  };

  // Handler untuk notification click
  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);
    router.push('/notifications');
    setShowNotification(false);
  };

  // Komentar untuk foto saat ini
  const currentPhotoComments = comments.filter(comment => comment.photoIndex === currentPhotoIndex);

  // ==================== RENDER COMPONENT ====================
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
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

{/* FRAMED LAYOUT (INSET LAYOUT) - Background utama #dbd6c9 dengan border radius */}
<div style={{
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#dbd6c9',
  borderRadius: isMobile ? '0' : '40px',
  margin: isMobile ? '0' : '20px',
  width: isMobile ? 'calc(100% - 0px)' : 'calc(100% - 40px)',
  boxSizing: 'border-box',
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
}}>
  {/* Inner content container dengan padding */}
  <div style={{
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#dbd6c9',
    position: 'relative',
    padding: isMobile ? '0' : '0',
    borderRadius: isMobile ? '0' : '40px'
  }}>

{/* MENURU OVERLAY - Setelah Loading Selesai */}
<AnimatePresence>
  {showMenuruOverlay && (
    <motion.div
      id="menuru-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#dbd6c9',
        zIndex: 99998,
        overflow: 'hidden',
        pointerEvents: 'auto',
        borderRadius: isMobile ? '0' : '40px'
      }}
    >
      {/* Teks MENURU besar di kiri atas */}
      <div
        style={{
          position: 'absolute',
          top: isMobile ? '1rem' : '2rem',
          left: isMobile ? '1rem' : '2rem',
          color: '#000000',
          fontSize: isMobile ? '200px' : '490px',
          fontWeight: '300',
          fontFamily: 'Helvetica, Arial, sans-serif',
          textTransform: 'uppercase',
          lineHeight: 0.8,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap'
        }}
      >
        MENURU
      </div>

      {/* Profile Link - dengan jarak yang tepat dari teks MENURU */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        onClick={() => {
          setShowMenuruOverlay(false);
          router.push('/profile');
        }}
        style={{
          position: 'absolute',
          top: isMobile ? 'calc(200px + 3rem)' : 'calc(490px + 4rem)',
          left: isMobile ? '2rem' : '4rem',
          cursor: 'pointer',
          zIndex: 99999
        }}
        whileHover={{ x: 5 }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
          {/* Angka 01 gaya Awwards */}
          <span style={{
            color: 'rgba(0,0,0,0.4)',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: '300',
            fontFamily: 'monospace',
            letterSpacing: '1px'
          }}>
            01
          </span>
          
          {/* Teks Profile - tanpa underline, tidak tebal */}
          <span style={{
            color: '#000000',
            fontSize: isMobile ? '2.5rem' : '4rem',
            fontWeight: '300',
            fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '1px',
            textTransform: 'capitalize'
          }}>
            Profile
          </span>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      

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
              backgroundColor: '#dbd6c9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              cursor: 'default',
              borderRadius: isMobile ? '0' : '40px'
            }}
          >
            <div
              ref={gsapLoadingRef}
              style={{
                color: '#000000',
                textAlign: 'center',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: isMobile ? '3rem' : '4rem',
                fontWeight: '300',
                letterSpacing: '1px'
              }}
            >
              <span>We </span>
              <span 
                ref={loadingTextRef}
                style={{
                  display: 'inline-block',
                  minWidth: isMobile ? '150px' : '200px',
                  textAlign: 'left'
                }}
              >
                {rotatingWords[currentWordIndex]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animasi Notifikasi Baru */}
      <AnimatePresence>
        {showNotificationAnimation && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '6rem',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: '#dbd6c9',
              padding: '1rem 2rem',
              borderRadius: '50px',
              zIndex: 10002,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: '1px solid rgba(0,0,0,0.2)'
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dbd6c9" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </motion.div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{newNotificationText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Overlay */}
      <AnimatePresence>
        {showCommunityOverlay && (
          <motion.div
            ref={communityOverlayRef}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              backgroundColor: '#dbd6c9',
              zIndex: 10004,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{
              padding: isMobile ? '1.5rem' : '2rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <h2 style={{
                color: '#000000',
                fontSize: isMobile ? '1.8rem' : '2.5rem',
                fontWeight: '300',
                margin: 0,
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '1px'
              }}>
                Community
              </h2>
              
              <motion.button
                onClick={handleCloseCommunityOverlay}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  color: '#000000',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
              >
                ×
              </motion.button>
            </div>

            <div style={{
              padding: isMobile ? '2rem 1.5rem' : '3rem 3rem',
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 100px)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: isMobile ? '2rem' : '4rem'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {communityItemsLeft.map((item, index) => (
                    <motion.div
                      key={`community-left-${item.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem 0'
                      }}
                      whileHover={{ x: 5 }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          opacity: 0.7,
                          flexShrink: 0
                        }}
                      >
                        <path d="M17 7L7 17" />
                        <path d="M7 7h10v10" />
                      </svg>
                      
                      <span style={{
                        color: '#000000',
                        fontSize: isMobile ? '1.5rem' : '2.2rem',
                        fontWeight: '300',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        letterSpacing: '0.5px'
                      }}>
                        {item.name}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {communityItemsRight.map((item, index) => (
                    <motion.div
                      key={`community-right-${item.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + 3) * 0.1 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem 0'
                      }}
                      whileHover={{ x: 5 }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          opacity: 0.7,
                          flexShrink: 0
                        }}
                      >
                        <path d="M17 7L7 17" />
                        <path d="M7 7h10v10" />
                      </svg>
                      
                      <span style={{
                        color: '#000000',
                        fontSize: isMobile ? '1.5rem' : '2.2rem',
                        fontWeight: '300',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        letterSpacing: '0.5px'
                      }}>
                        {item.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRODUCT OVERLAY */}
      <AnimatePresence>
        {showProductOverlay && (
          <motion.div
            ref={productOverlayRef}
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ clipPath: 'circle(0% at 50% 50%)' }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#dbd6c9',
              zIndex: 10010,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              color: '#000000',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 0%, transparent 30%),
                radial-gradient(circle at 80% 70%, rgba(0,0,0,0.02) 0%, transparent 30%),
                repeating-linear-gradient(45deg, rgba(0,0,0,0.005) 0px, rgba(0,0,0,0.005) 1px, transparent 1px, transparent 20px)
              `,
              pointerEvents: 'none',
              zIndex: 1
            }} />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleCloseProductOverlay}
              style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '1px solid rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10020,
                backgroundColor: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(10px)',
                fontSize: '2rem',
                color: '#000000'
              }}
              whileHover={{ 
                scale: 1.1,
                borderColor: 'rgba(0,0,0,0.5)',
                backgroundColor: 'rgba(255,255,255,0.8)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              ×
            </motion.div>

            <div style={{
              position: 'relative',
              zIndex: 2,
              padding: isMobile ? '6rem 2rem 4rem 2rem' : '8rem 4rem 4rem 4rem',
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%'
            }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{ marginBottom: '4rem' }}
              >
                <span style={{
                  color: 'rgba(0,0,0,0.5)',
                  fontSize: '1rem',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '1rem'
                }}>
                  — 01
                </span>
                <h1 style={{
                  fontSize: isMobile ? '4rem' : '7rem',
                  fontWeight: '300',
                  margin: 0,
                  lineHeight: 1,
                  letterSpacing: '-2px',
                  color: '#000000'
                }}>
                  SHOP
                </h1>
                <div style={{
                  width: '100px',
                  height: '2px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  marginTop: '2rem'
                }} />
              </motion.div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '4rem',
                marginBottom: '4rem'
              }}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '300',
                    margin: '0 0 2rem 0',
                    color: '#000000'
                  }}>
                    Digital Products & Merchandise
                  </h2>
                  <p style={{
                    fontSize: '1.2rem',
                    lineHeight: 1.8,
                    color: 'rgba(0,0,0,0.7)',
                    marginBottom: '2rem'
                  }}>
                    Explore our collection of digital products, exclusive merchandise, 
                    and creative tools designed to enhance your creative journey.
                  </p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                  }}>
                    {[
                      { label: 'Digital Assets', value: '50+ Items' },
                      { label: 'Physical Products', value: '12 Items' },
                      { label: 'Limited Edition', value: '5 Items' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + (index * 0.1) }}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem 0',
                          borderBottom: '1px solid rgba(0,0,0,0.1)'
                        }}
                      >
                        <span style={{ color: 'rgba(0,0,0,0.6)' }}>{item.label}</span>
                        <span style={{ color: '#000000', fontSize: '1.2rem' }}>{item.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    padding: '2rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '300',
                      margin: '0 0 2rem 0',
                      color: '#000000'
                    }}>
                      Featured Products
                    </h3>
                    {[1, 2, 3].map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + (item * 0.1) }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem 0',
                          borderBottom: item < 3 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                          cursor: 'pointer'
                        }}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: '#000000' }}>Product {item}</div>
                          <div style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)' }}>$49.99</div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                          <path d="M7 7h10v10"/>
                          <path d="M17 7L7 17"/>
                        </svg>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  marginTop: '4rem',
                  padding: '2rem 0',
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '2rem'
                }}
              >
                <div style={{ color: 'rgba(0,0,0,0.5)' }}>
                  © 2024 MENURU SHOP
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  {['Shop All', 'New Arrivals', 'Best Sellers'].map((item) => (
                    <span key={item} style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.8)' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VISUAL DESIGNER OVERLAY */}
      <AnimatePresence>
        {showVisualDesignerOverlay && (
          <motion.div
            ref={visualDesignerOverlayRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#dbd6c9',
              zIndex: 10011,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              color: '#000000',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `
                radial-gradient(circle at 30% 40%, rgba(0,0,0,0.02) 0%, transparent 40%),
                radial-gradient(circle at 70% 60%, rgba(0,0,0,0.02) 0%, transparent 40%),
                repeating-linear-gradient(45deg, rgba(0,0,0,0.005) 0px, rgba(0,0,0,0.005) 2px, transparent 2px, transparent 12px)
              `,
              pointerEvents: 'none',
              zIndex: 1
            }} />

            <div
              ref={visualDesignerCloseRef}
              onClick={handleCloseVisualDesignerOverlay}
              style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10020,
                color: '#000000',
                fontSize: '2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                opacity: 0,
                transform: 'scale(0.5) rotate(-180deg)'
              }}
            >
              ×
            </div>

            <div style={{
              position: 'relative',
              zIndex: 2,
              padding: isMobile ? '6rem 2rem 4rem 2rem' : '8rem 4rem 4rem 4rem',
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%'
            }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  marginBottom: '4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <span style={{
                    color: 'rgba(0,0,0,0.3)',
                    fontSize: '1.2rem',
                    fontWeight: '300',
                    letterSpacing: '2px',
                    fontFamily: 'monospace'
                  }}>
                    02
                  </span>
                  
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 7L7 17" />
                    <path d="M7 7h10v10" />
                  </svg>
                  
                  <h1 style={{
                    fontSize: isMobile ? '4rem' : '7rem',
                    fontWeight: '300',
                    margin: 0,
                    lineHeight: 1,
                    letterSpacing: '-2px',
                    color: '#000000'
                  }}>
                    VISUAL DESIGNER
                  </h1>
                </div>
              </motion.div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '4rem'
              }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '300',
                    margin: '0 0 2rem 0',
                    color: '#000000'
                  }}>
                    Visual Designer
                  </h2>
                  <p style={{
                    fontSize: '1.2rem',
                    lineHeight: 1.8,
                    color: 'rgba(0,0,0,0.7)',
                    marginBottom: '2rem'
                  }}>
                    Crafting digital experiences with minimalist aesthetics and functional design. 
                    Every pixel tells a story, combining beauty with usability.
                  </p>
                  
                  <div style={{ marginTop: '3rem' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '300',
                      margin: '0 0 1.5rem 0',
                      color: '#000000',
                      borderBottom: '1px solid rgba(0,0,0,0.1)',
                      paddingBottom: '0.5rem'
                    }}>
                      Design Philosophy
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      {[
                        { label: 'Minimalist', desc: 'Clean, simple, purposeful' },
                        { label: 'Responsive', desc: 'Adapts to every screen' },
                        { label: 'Modern', desc: 'Contemporary aesthetics' },
                        { label: 'Fast', desc: 'Optimized performance' }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + (index * 0.1) }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.5rem 0',
                            borderBottom: '1px solid rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.3)'
                          }} />
                          <div>
                            <span style={{ color: '#000000', fontSize: '1.1rem', marginRight: '1rem' }}>
                              {item.label}
                            </span>
                            <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.9rem' }}>
                              {item.desc}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INDONESIA OVERLAY */}
      <AnimatePresence>
        {showIndonesiaOverlay && (
          <motion.div
            ref={indonesiaOverlayRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#dbd6c9',
              zIndex: 10012,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              color: '#000000',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(0,100,0,0.02) 0%, transparent 30%),
                radial-gradient(circle at 80% 70%, rgba(0,100,0,0.02) 0%, transparent 30%),
                repeating-linear-gradient(45deg, rgba(0,0,0,0.01) 0px, rgba(0,0,0,0.01) 2px, transparent 2px, transparent 30px)
              `,
              pointerEvents: 'none',
              zIndex: 1
            }} />

            <div
              ref={indonesiaCloseRef}
              onClick={handleCloseIndonesiaOverlay}
              style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10020,
                color: '#000000',
                fontSize: '2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                opacity: 0,
                transform: 'scale(0.5) rotate(-180deg)'
              }}
            >
              ×
            </div>

            <div style={{
              position: 'relative',
              zIndex: 2,
              padding: isMobile ? '6rem 2rem 4rem 2rem' : '8rem 4rem 4rem 4rem',
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%'
            }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  marginBottom: '4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <span style={{
                    color: 'rgba(0,0,0,0.3)',
                    fontSize: '1.2rem',
                    fontWeight: '300',
                    letterSpacing: '2px',
                    fontFamily: 'monospace'
                  }}>
                    03
                  </span>
                  
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 7L7 17" />
                    <path d="M7 7h10v10" />
                  </svg>
                  
                  <h1 style={{
                    fontSize: isMobile ? '4rem' : '7rem',
                    fontWeight: '300',
                    margin: 0,
                    lineHeight: 1,
                    letterSpacing: '-2px',
                    color: '#000000'
                  }}>
                    INDONESIA
                  </h1>
                </div>
              </motion.div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '4rem'
              }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div style={{
                    width: '100%',
                    height: isMobile ? '300px' : '400px',
                    backgroundColor: '#f0ebe0',
                    border: '1px solid rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.6091242787!2d106.773991!3d-6.229746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Jakarta Map"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '300',
                    margin: '0 0 2rem 0',
                    color: '#000000'
                  }}>
                    Based in Jakarta
                  </h2>
                  <p style={{
                    fontSize: '1.2rem',
                    lineHeight: 1.8,
                    color: 'rgba(0,0,0,0.7)',
                    marginBottom: '2rem'
                  }}>
                    Operating from the heart of Southeast Asia's most dynamic city, 
                    we bring a unique perspective shaped by Indonesia's rich culture 
                    and rapid digital transformation.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DONASI TRACKING OVERLAY - PANTAU DONASI USER */}
      <AnimatePresence>
        {showDonasiTracking && user && (
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
              backgroundColor: 'rgba(219, 214, 201, 0.98)',
              zIndex: 10013,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
            onClick={handleCloseDonasiTracking}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: '#dbd6c9',
                borderRadius: '20px',
                width: '95%',
                maxWidth: '800px',
                height: '90vh',
                maxHeight: '700px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{
                    color: '#000000',
                    fontSize: isMobile ? '1.8rem' : '2.5rem',
                    fontWeight: '300',
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '1px'
                  }}>
                    PANTAU DONASI
                  </h2>
                  <div style={{
                    backgroundColor: 'transparent',
                    color: 'rgba(0,0,0,0.8)',
                    fontSize: '0.9rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(0,0,0,0.3)'
                  }}>
                    Total: {formatRupiah(totalDonasiUser)}
                  </div>
                </div>
                
                <motion.button
                  onClick={handleCloseDonasiTracking}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    color: '#000000',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                >
                  ×
                </motion.button>
              </div>

              {/* Info User */}
              <div style={{
                padding: isMobile ? '1rem 1.5rem' : '1.5rem 2rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexShrink: 0
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#000000'
                }}>
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#000000', fontSize: '1.2rem', fontWeight: '500' }}>
                    {userDisplayName}
                  </div>
                  <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.9rem' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Konten Donasi */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1.5rem' : '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: 'rgba(0,0,0,0.1)'
                  }} />
                  <span style={{
                    color: 'rgba(0,0,0,0.6)',
                    fontSize: '0.9rem',
                    letterSpacing: '1px'
                  }}>
                    RIWAYAT DONASI
                  </span>
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: 'rgba(0,0,0,0.1)'
                  }} />
                </div>

                {isLoadingDonations ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '3rem'
                  }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{
                        width: '30px',
                        height: '30px',
                        border: '2px solid rgba(0,0,0,0.2)',
                        borderTopColor: '#000000',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                ) : userDonations.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '12px'
                  }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                      <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 22v-4M19.07 19.07l-2.83-2.83M22 12h-4M19.07 4.93l-2.83 2.83"/>
                      <circle cx="12" cy="12" r="4"/>
                    </svg>
                    <p>Belum ada donasi yang dilakukan</p>
                    <motion.button
                      onClick={() => {
                        handleCloseDonasiTracking();
                        router.push('/donatur');
                      }}
                      style={{
                        marginTop: '1.5rem',
                        padding: '0.8rem 2rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(0,0,0,0.3)',
                        color: '#000000',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                    >
                      Mulai Donasi
                    </motion.button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {userDonations.map((donation, index) => (
                      <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          padding: '1.2rem',
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.8rem'
                        }}>
                          <div>
                            <h3 style={{
                              color: '#000000',
                              fontSize: '1.1rem',
                              fontWeight: '500',
                              margin: 0
                            }}>
                              {donation.eventTitle}
                            </h3>
                            <p style={{
                              color: 'rgba(0,0,0,0.6)',
                              fontSize: '0.8rem',
                              margin: '0.3rem 0 0 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {formatTime(donation.createdAt)}
                            </p>
                          </div>
                          <span style={{
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            color: '#000000'
                          }}>
                            {formatRupiah(donation.amount)}
                          </span>
                        </div>
                        {donation.message && (
                          <div style={{
                            marginTop: '0.8rem',
                            padding: '0.8rem',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: '8px',
                            fontStyle: 'italic',
                            color: 'rgba(0,0,0,0.8)',
                            fontSize: '0.9rem'
                          }}>
                            "{donation.message}"
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer dengan tombol ke halaman donasi */}
              <div style={{
                padding: isMobile ? '1rem 1.5rem' : '1.5rem 2rem',
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <motion.button
                  onClick={() => {
                    handleCloseDonasiTracking();
                    router.push('/donatur');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.8rem 2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(0,0,0,0.3)',
                    borderRadius: '30px',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    gap: '1.2rem'
                  }}
                >
                  <span>Buka Halaman Donasi</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M17 7L7 17" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Overlay */}
      <AnimatePresence>
        {showNoteOverlay && (
          <motion.div
            ref={noteOverlayRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#dbd6c9',
              zIndex: 10003,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRight: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{
              padding: isMobile ? '1.5rem' : '2rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{
                  color: '#000000',
                  fontSize: isMobile ? '1.8rem' : '2.5rem',
                  fontWeight: '300',
                  margin: 0,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '1px'
                }}>
                  NOTE
                </h2>
                {user && (
                  <span style={{
                    color: 'rgba(0,0,0,0.5)',
                    fontSize: '0.9rem',
                    padding: '0.2rem 0.8rem',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '20px'
                  }}>
                    {totalNotesCount} notes
                  </span>
                )}
              </div>
              
              <motion.button
                onClick={handleCloseNoteOverlay}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  color: '#000000',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
              >
                ×
              </motion.button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '2rem 1.5rem' : '3rem'
            }}>
              {!user ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'rgba(0,0,0,0.7)',
                  gap: '2rem'
                }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <p style={{ textAlign: 'center' }}>Silakan login untuk melihat catatan Anda</p>
                  <motion.button
                    onClick={handleSignInClick}
                    style={{
                      padding: '0.8rem 2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(0,0,0,0.3)',
                      color: '#000000',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                  >
                    SIGN IN
                  </motion.button>
                </div>
              ) : isLoadingNotes ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderTopColor: '#000000',
                      borderRadius: '50%'
                    }}
                  />
                </div>
              ) : !userNotes || userNotes.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'rgba(0,0,0,0.7)',
                  gap: '2rem'
                }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <p style={{ textAlign: 'center' }}>Belum ada catatan</p>
                  <motion.button
                    onClick={() => router.push('/notes')}
                    style={{
                      padding: '0.8rem 2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(0,0,0,0.3)',
                      color: '#000000',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                  >
                    BUAT CATATAN
                  </motion.button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  <div style={{ color: '#000000', marginBottom: '1rem', fontSize: '0.8rem', opacity: 0.5 }}>
                    Total notes: {userNotes.length}
                  </div>

                  {/* Kategori: Personal */}
                  {userNotes.filter(note => note.category?.toLowerCase() === 'personal').length > 0 && (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                      }}>
                        <span style={{
                          color: '#000000',
                          fontSize: '1.2rem',
                          fontWeight: '300',
                          textTransform: 'uppercase',
                          letterSpacing: '2px'
                        }}>
                          PERSONAL
                        </span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                        <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem' }}>
                          {userNotes.filter(n => n.category?.toLowerCase() === 'personal').length} notes
                        </span>
                      </div>

                      {Object.entries(
                        userNotes
                          .filter(note => note.category?.toLowerCase() === 'personal')
                          .reduce((acc: any, note) => {
                            let year = 'Unknown';
                            if (note.createdAt) {
                              const date = note.createdAt instanceof Timestamp 
                                ? note.createdAt.toDate() 
                                : new Date(note.createdAt);
                              year = date.getFullYear().toString();
                            }
                            if (!acc[year]) acc[year] = [];
                            acc[year].push(note);
                            return acc;
                          }, {})
                      )
                        .sort(([yearA]: [string, any], [yearB]: [string, any]) => {
                          if (yearA === 'Unknown') return 1;
                          if (yearB === 'Unknown') return -1;
                          return Number(yearB) - Number(yearA);
                        })
                        .map(([year, notes]: [string, any[]]) => (
                          <div key={`personal-${year}`} style={{ marginBottom: '2rem' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginBottom: '1rem',
                              marginLeft: '1rem'
                            }}>
                              <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: '0.9rem' }}>{year}</span>
                              <div style={{ width: '20px', height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                              <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: '0.8rem' }}>
                                {notes.length} note{notes.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {notes.map((note: Note, index: number) => {
                                let dateStr = '--/--';
                                if (note.createdAt) {
                                  const date = note.createdAt instanceof Timestamp 
                                    ? note.createdAt.toDate() 
                                    : new Date(note.createdAt);
                                  dateStr = date.toLocaleDateString('id-ID', { 
                                    day: '2-digit', 
                                    month: '2-digit' 
                                  });
                                }
                                
                                return (
                                  <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => router.push(`/notes/${note.id}`)}
                                    style={{
                                      padding: '1rem 1.5rem',
                                      backgroundColor: 'transparent',
                                      border: '1px solid rgba(0,0,0,0.1)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                    whileHover={{
                                      backgroundColor: 'rgba(0,0,0,0.02)',
                                      borderColor: 'rgba(0,0,0,0.3)',
                                      x: 5
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                      <span style={{ 
                                        color: 'rgba(0,0,0,0.3)', 
                                        fontSize: '0.8rem', 
                                        minWidth: '45px',
                                        fontFamily: 'monospace'
                                      }}>
                                        {dateStr}
                                      </span>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ color: '#000000', fontSize: '1rem' }}>
                                          {note.title || 'Untitled Note'}
                                        </div>
                                        {note.content && (
                                          <div style={{ 
                                            color: 'rgba(0,0,0,0.5)', 
                                            fontSize: '0.8rem',
                                            marginTop: '0.2rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '300px'
                                          }}>
                                            {note.content.substring(0, 50)}...
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5">
                                      <path d="M7 7h10v10" />
                                      <path d="M17 7L7 17" />
                                    </svg>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Kategori: Collaborate */}
                  {userNotes.filter(note => note.category?.toLowerCase() === 'collaborate').length > 0 && (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                      }}>
                        <span style={{
                          color: '#000000',
                          fontSize: '1.2rem',
                          fontWeight: '300',
                          textTransform: 'uppercase',
                          letterSpacing: '2px'
                        }}>
                          COLLABORATE
                        </span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                        <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem' }}>
                          {userNotes.filter(n => n.category?.toLowerCase() === 'collaborate').length} notes
                        </span>
                      </div>

                      {Object.entries(
                        userNotes
                          .filter(note => note.category?.toLowerCase() === 'collaborate')
                          .reduce((acc: any, note) => {
                            let year = 'Unknown';
                            if (note.createdAt) {
                              const date = note.createdAt instanceof Timestamp 
                                ? note.createdAt.toDate() 
                                : new Date(note.createdAt);
                              year = date.getFullYear().toString();
                            }
                            if (!acc[year]) acc[year] = [];
                            acc[year].push(note);
                            return acc;
                          }, {})
                      )
                        .sort(([yearA]: [string, any], [yearB]: [string, any]) => {
                          if (yearA === 'Unknown') return 1;
                          if (yearB === 'Unknown') return -1;
                          return Number(yearB) - Number(yearA);
                        })
                        .map(([year, notes]: [string, any[]]) => (
                          <div key={`collaborate-${year}`} style={{ marginBottom: '2rem' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginBottom: '1rem',
                              marginLeft: '1rem'
                            }}>
                              <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: '0.9rem' }}>{year}</span>
                              <div style={{ width: '20px', height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                              <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: '0.8rem' }}>
                                {notes.length} note{notes.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {notes.map((note: Note, index: number) => {
                                let dateStr = '--/--';
                                if (note.createdAt) {
                                  const date = note.createdAt instanceof Timestamp 
                                    ? note.createdAt.toDate() 
                                    : new Date(note.createdAt);
                                  dateStr = date.toLocaleDateString('id-ID', { 
                                    day: '2-digit', 
                                    month: '2-digit' 
                                  });
                                }
                                
                                return (
                                  <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => router.push(`/notes/${note.id}`)}
                                    style={{
                                      padding: '1rem 1.5rem',
                                      backgroundColor: 'transparent',
                                      border: '1px solid rgba(0,0,0,0.1)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                    whileHover={{
                                      backgroundColor: 'rgba(0,0,0,0.02)',
                                      borderColor: 'rgba(0,0,0,0.3)',
                                      x: 5
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                      <span style={{ 
                                        color: 'rgba(0,0,0,0.3)', 
                                        fontSize: '0.8rem', 
                                        minWidth: '45px',
                                        fontFamily: 'monospace'
                                      }}>
                                        {dateStr}
                                      </span>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ color: '#000000', fontSize: '1rem' }}>
                                          {note.title || 'Untitled Note'}
                                        </div>
                                        {note.content && (
                                          <div style={{ 
                                            color: 'rgba(0,0,0,0.5)', 
                                            fontSize: '0.8rem',
                                            marginTop: '0.2rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '300px'
                                          }}>
                                            {note.content.substring(0, 50)}...
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5">
                                      <path d="M7 7h10v10" />
                                      <path d="M17 7L7 17" />
                                    </svg>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Kategori: Lainnya */}
                  {userNotes.filter(note => {
                    const cat = note.category?.toLowerCase() || '';
                    return cat !== 'personal' && cat !== 'collaborate';
                  }).length > 0 && (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                      }}>
                        <span style={{
                          color: '#000000',
                          fontSize: '1.2rem',
                          fontWeight: '300',
                          textTransform: 'uppercase',
                          letterSpacing: '2px'
                        }}>
                          LAINNYA
                        </span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                        <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem' }}>
                          {userNotes.filter(n => {
                            const cat = n.category?.toLowerCase() || '';
                            return cat !== 'personal' && cat !== 'collaborate';
                          }).length} notes
                        </span>
                      </div>

                      {Object.entries(
                        userNotes
                          .filter(note => {
                            const cat = note.category?.toLowerCase() || '';
                            return cat !== 'personal' && cat !== 'collaborate';
                          })
                          .reduce((acc: any, note) => {
                            let year = 'Unknown';
                            if (note.createdAt) {
                              const date = note.createdAt instanceof Timestamp 
                                ? note.createdAt.toDate() 
                                : new Date(note.createdAt);
                              year = date.getFullYear().toString();
                            }
                            if (!acc[year]) acc[year] = [];
                            acc[year].push(note);
                            return acc;
                          }, {})
                      )
                        .sort(([yearA]: [string, any], [yearB]: [string, any]) => {
                          if (yearA === 'Unknown') return 1;
                          if (yearB === 'Unknown') return -1;
                          return Number(yearB) - Number(yearA);
                        })
                        .map(([year, notes]: [string, any[]]) => (
                          <div key={`lainnya-${year}`} style={{ marginBottom: '2rem' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginBottom: '1rem',
                              marginLeft: '1rem'
                            }}>
                              <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: '0.9rem' }}>{year}</span>
                              <div style={{ width: '20px', height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                              <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: '0.8rem' }}>
                                {notes.length} note{notes.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {notes.map((note: Note, index: number) => {
                                let dateStr = '--/--';
                                if (note.createdAt) {
                                  const date = note.createdAt instanceof Timestamp 
                                    ? note.createdAt.toDate() 
                                    : new Date(note.createdAt);
                                  dateStr = date.toLocaleDateString('id-ID', { 
                                    day: '2-digit', 
                                    month: '2-digit' 
                                  });
                                }
                                
                                return (
                                  <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => router.push(`/notes/${note.id}`)}
                                    style={{
                                      padding: '1rem 1.5rem',
                                      backgroundColor: 'transparent',
                                      border: '1px solid rgba(0,0,0,0.1)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                    whileHover={{
                                      backgroundColor: 'rgba(0,0,0,0.02)',
                                      borderColor: 'rgba(0,0,0,0.3)',
                                      x: 5
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                      <span style={{ 
                                        color: 'rgba(0,0,0,0.3)', 
                                        fontSize: '0.8rem', 
                                        minWidth: '45px',
                                        fontFamily: 'monospace'
                                      }}>
                                        {dateStr}
                                      </span>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ color: '#000000', fontSize: '1rem' }}>
                                          {note.title || 'Untitled Note'}
                                        </div>
                                        {note.content && (
                                          <div style={{ 
                                            color: 'rgba(0,0,0,0.5)', 
                                            fontSize: '0.8rem',
                                            marginTop: '0.2rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '300px'
                                          }}>
                                            {note.content.substring(0, 50)}...
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5">
                                      <path d="M7 7h10v10" />
                                      <path d="M17 7L7 17" />
                                    </svg>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Kalender Tahun Baru */}
      <AnimatePresence>
        {showCalendarModal && (
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
              backgroundColor: 'rgba(219, 214, 201, 0.98)',
              zIndex: 10002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              overflow: 'auto',
              padding: isMobile ? '1rem' : '2rem'
            }}
          >
            <motion.div
              ref={calendarModalRef}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: '#dbd6c9',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '1200px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{
                    color: '#000000',
                    fontSize: isMobile ? '1.8rem' : '2.5rem',
                    fontWeight: '300',
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '1px'
                  }}>
                    {sectionDescriptions.calendar.title} {currentYear}
                  </h2>
                  <div style={{
                    backgroundColor: 'transparent',
                    color: '#000000',
                    fontSize: '0.9rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(0, 0, 0, 0.3)'
                  }}>
                    {calendarEvents.length} Events
                  </div>
                </div>
                <motion.button
                  onClick={() => {
                    setShowCalendarModal(false);
                    setSelectedDate(null);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    color: '#000000',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                >
                  ×
                </motion.button>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1rem' : '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '10px'
                  }}
                >
                  <p style={{
                    color: 'rgba(0,0,0,0.8)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    {sectionDescriptions.calendar.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    {sectionDescriptions.calendar.features.map((feature, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '0.3rem 1rem',
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          borderRadius: '20px',
                          color: 'rgba(0,0,0,0.7)',
                          fontSize: '0.8rem'
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <motion.button
                      onClick={() => navigateMonth('prev')}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(0, 0, 0, 0.3)',
                        color: '#000000',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </motion.button>
                    <div style={{
                      color: '#000000',
                      fontSize: isMobile ? '1.5rem' : '2rem',
                      fontWeight: '400',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      minWidth: '200px',
                      textAlign: 'center'
                    }}>
                      {getMonthName(currentMonth)} {currentYear}
                    </div>
                    <motion.button
                      onClick={() => navigateMonth('next')}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(0, 0, 0, 0.3)',
                        color: '#000000',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </motion.button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[2024, 2025, 2026, 2027, 2028].map(year => (
                      <motion.button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        style={{
                          backgroundColor: currentYear === year ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                          border: '1px solid rgba(0, 0, 0, 0.3)',
                          color: '#000000',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          whiteSpace: 'nowrap'
                        }}
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                      >
                        {year}
                      </motion.button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((month, index) => (
                      <motion.button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        style={{
                          backgroundColor: currentMonth === index ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                          border: '1px solid rgba(0, 0, 0, 0.3)',
                          color: '#000000',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '15px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          minWidth: '40px'
                        }}
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                      >
                        {month}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem',
                    padding: '0.5rem 0'
                  }}>
                    {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
                      <div key={day} style={{
                        color: 'rgba(0, 0, 0, 0.7)',
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        padding: '0.5rem',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {generateCalendar().map((day, index) => {
                      if (!day) return <div key={`empty-${index}`} style={{ height: '100px' }} />;
                      const hasEvents = day.events && day.events.length > 0;
                      return (
                        <motion.div
                          key={`day-${day.date}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.005 }}
                          onClick={() => setSelectedDate(day.fullDate)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            borderRadius: '10px',
                            padding: '0.8rem',
                            minHeight: '100px',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                          }}
                          whileHover={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
                            borderColor: 'rgba(0, 0, 0, 0.4)'
                          }}
                        >
                          <div style={{
                            color: day.isToday ? '#3B82F6' : '#000000',
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            fontWeight: day.isToday ? '700' : '400',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>{day.date}</span>
                            {day.isToday && (
                              <div style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#3B82F6',
                                borderRadius: '50%'
                              }} />
                            )}
                          </div>
                          {hasEvents && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.3rem',
                              maxHeight: '70px',
                              overflowY: 'auto'
                            }}>
                              {day.events.slice(0, 3).map(event => (
                                <div
                                  key={event.id}
                                  style={{
                                    backgroundColor: event.color + '20',
                                    borderLeft: `3px solid ${event.color}`,
                                    padding: '0.2rem 0.4rem',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDate(day.fullDate);
                                  }}
                                >
                                  <div style={{
                                    color: '#000000',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {event.title}
                                  </div>
                                  <div style={{
                                    color: 'rgba(0, 0, 0, 0.7)',
                                    fontSize: '0.6rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.2rem'
                                  }}>
                                    <span style={{
                                      backgroundColor: event.color,
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%'
                                    }} />
                                    {event.label}
                                  </div>
                                </div>
                              ))}
                              {day.events.length > 3 && (
                                <div style={{
                                  color: 'rgba(0, 0, 0, 0.5)',
                                  fontSize: '0.6rem',
                                  textAlign: 'center'
                                }}>
                                  +{day.events.length - 3} lainnya
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      border: '1px solid rgba(0, 0, 0, 0.2)',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <h3 style={{
                        color: '#000000',
                        fontSize: '1.3rem',
                        fontWeight: '400',
                        margin: 0,
                        fontFamily: 'Helvetica, Arial, sans-serif'
                      }}>
                        {getDayName(selectedDate.getDay())}, {selectedDate.getDate()} {getMonthName(selectedDate.getMonth())} {selectedDate.getFullYear()}
                      </h3>
                      <motion.button
                        onClick={() => setSelectedDate(null)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(0, 0, 0, 0.3)',
                          color: '#000000',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem'
                        }}
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                      >
                        ×
                      </motion.button>
                    </div>

                    {(() => {
                      if (isLoadingEvents) return null;
                      const eventsForSelectedDate = calendarEvents.filter(event =>
                        event.date.getDate() === selectedDate.getDate() &&
                        event.date.getMonth() === selectedDate.getMonth() &&
                        event.date.getFullYear() === selectedDate.getFullYear()
                      );
                      if (eventsForSelectedDate.length === 0) {
                        return (
                          <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.5)',
                            fontFamily: 'Helvetica, Arial, sans-serif'
                          }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                              <path d="M8 2v4M16 2v4M3 10h18M5 4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H5z"/>
                            </svg>
                            <p style={{ marginTop: '1rem' }}>Tidak ada kegiatan pada tanggal ini</p>
                          </div>
                        );
                      }
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {eventsForSelectedDate.map(event => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              style={{
                                backgroundColor: 'transparent',
                                border: `1px solid ${event.color}40`,
                                borderRadius: '10px',
                                padding: '1rem',
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'flex-start'
                              }}
                            >
                              <div style={{
                                width: '4px',
                                height: '100%',
                                backgroundColor: event.color,
                                borderRadius: '2px',
                                flexShrink: 0
                              }} />
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  marginBottom: '0.5rem',
                                  flexWrap: 'wrap',
                                  gap: '0.5rem'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    flexWrap: 'wrap'
                                  }}>
                                    <h4 style={{
                                      color: '#000000',
                                      fontSize: '1.1rem',
                                      fontWeight: '600',
                                      margin: 0,
                                      fontFamily: 'Helvetica, Arial, sans-serif'
                                    }}>
                                      {event.title}
                                    </h4>
                                    <div style={{
                                      backgroundColor: event.color + '30',
                                      color: event.color,
                                      fontSize: '0.7rem',
                                      fontWeight: '700',
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: '12px',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      border: `1px solid ${event.color}`
                                    }}>
                                      {event.label}
                                    </div>
                                  </div>
                                  <div style={{
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                  }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10"/>
                                      <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {event.date.getHours().toString().padStart(2, '0')}:{event.date.getMinutes().toString().padStart(2, '0')}
                                  </div>
                                </div>
                                <p style={{
                                  color: 'rgba(0, 0, 0, 0.8)',
                                  fontSize: '0.9rem',
                                  margin: '0 0 0.8rem 0',
                                  lineHeight: 1.5,
                                  fontFamily: 'Helvetica, Arial, sans-serif'
                                }}>
                                  {event.description}
                                </p>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginTop: '0.5rem'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}>
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      color: '#000000'
                                    }}>
                                      {event.createdBy.charAt(0)}
                                    </div>
                                    <span style={{
                                      color: 'rgba(0, 0, 0, 0.7)',
                                      fontSize: '0.8rem'
                                    }}>
                                      {event.createdBy}
                                      {event.isAdmin && (
                                        <span style={{
                                          marginLeft: '0.3rem',
                                          fontSize: '0.7rem',
                                          backgroundColor: 'transparent',
                                          color: '#000000',
                                          padding: '0.1rem 0.4rem',
                                          borderRadius: '4px',
                                          border: '1px solid rgba(0, 0, 0, 0.3)'
                                        }}>
                                          ADMIN
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Profil User */}
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
              backgroundColor: 'rgba(219, 214, 201, 0.98)',
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
                backgroundColor: '#dbd6c9',
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
              <div style={{
                width: '300px',
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem 0',
                flexShrink: 0
              }}>
                <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
                  <h3 style={{
                    color: '#000000',
                    fontSize: '2.5rem',
                    fontWeight: '300',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    margin: 0,
                    letterSpacing: '1px'
                  }}>
                    {userDisplayName}
                  </h3>
                  <p style={{
                    color: '#000000',
                    fontSize: '1rem',
                    margin: '0.5rem 0 0 0',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    opacity: 0.8
                  }}>
                    {user.email}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['notes', 'settings', 'help', 'feedback'].map((tab) => (
                    <motion.button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab as any);
                        if (tab === 'notes' && user) loadUserNotes(user.uid);
                      }}
                      style={{
                        width: '100%',
                        padding: '1.5rem 2rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: activeTab === tab ? '#000000' : 'rgba(0, 0, 0, 0.7)',
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
                         tab === 'help' ? 'Help' : 'Feedback'}
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
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                            <path d="M6 18L18 6"/>
                            <path d="M8 6h10v10"/>
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div style={{ marginTop: 'auto', padding: '2rem' }}>
                  <motion.button
                    onClick={handleLogoutClick}
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(0, 0, 0, 0.3)',
                      borderRadius: '0',
                      color: '#000000',
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

              <div style={{
                flex: 1,
                padding: '3rem',
                overflowY: 'auto',
                backgroundColor: 'transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                  <motion.button
                    onClick={() => setShowUserProfileModal(false)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#000000',
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

                {activeTab === 'notes' && (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '3rem'
                    }}>
                      <h4 style={{
                        color: '#000000',
                        fontSize: '3rem',
                        fontWeight: '300',
                        margin: 0,
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        letterSpacing: '0.5px'
                      }}>
                        Notes
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <motion.button
                          onClick={() => router.push('/notes')}
                          style={{
                            padding: '0.8rem 1.5rem',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            borderRadius: '0',
                            color: '#000000',
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
                        <div style={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: '0.9rem' }}>
                          Total: {totalNotesCount}
                        </div>
                      </div>
                    </div>

                    {isLoadingNotes ? (
                      <div style={{
                        padding: '4rem 0',
                        textAlign: 'center',
                        color: 'rgba(0, 0, 0, 0.7)',
                        fontFamily: 'Helvetica, Arial, sans-serif'
                      }}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{ marginBottom: '1rem' }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                        </motion.div>
                        Loading notes...
                      </div>
                    ) : !userNotes || userNotes.length === 0 ? (
                      <div style={{
                        padding: '6rem 0',
                        textAlign: 'center',
                        color: 'rgba(0, 0, 0, 0.7)',
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
                            color: '#000000',
                            border: '1px solid rgba(0, 0, 0, 0.3)',
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        {Array.isArray(userNotes) && userNotes.map((note) => {
                          if (!note || !note.id) return null;
                          const getVideoEmbedUrl = (link: string | undefined) => {
                            if (!link || typeof link !== 'string' || link.trim() === '') return null;
                            try {
                              const url = new URL(link);
                              if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
                                const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                                if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
                              }
                              if (url.hostname.includes('vimeo.com')) {
                                const videoId = url.pathname.split('/').pop();
                                if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
                              }
                              if (link.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) return link;
                              return null;
                            } catch { return null; }
                          };
                          const getVideoThumbnail = (link: string | undefined) => {
                            if (!link || typeof link !== 'string' || link.trim() === '') return null;
                            try {
                              const url = new URL(link);
                              if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
                                const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                                if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                              }
                              return null;
                            } catch { return null; }
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
                              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                              onClick={() => router.push('/notes')}
                            >
                              {hasValidCategory && (
                                <div style={{
                                  fontSize: '1.2rem',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                  color: 'rgba(0, 0, 0, 0.6)',
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
                                color: '#000000',
                                fontWeight: '400'
                              }}>
                                {note.title || 'Untitled Note'}
                              </div>
                              {hasValidContent && (
                                <div style={{
                                  fontSize: '1.3rem',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                  lineHeight: '1.6',
                                  color: 'rgba(0, 0, 0, 0.8)',
                                  marginTop: '1rem',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {note.content}
                                </div>
                              )}
                              {hasValidLink && videoEmbedUrl && (
                                <div style={{ margin: '1.5rem 0', position: 'relative' }}>
                                  {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com') ? (
                                    <div style={{
                                      position: 'relative',
                                      paddingBottom: '56.25%',
                                      height: 0,
                                      overflow: 'hidden',
                                      backgroundColor: '#f0ebe0',
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
                                      backgroundColor: '#f0ebe0',
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
                                          backgroundColor: '#f0ebe0'
                                        }}
                                        controls
                                        poster={videoThumbnail || undefined}
                                      />
                                    </div>
                                  ) : (
                                    <div style={{
                                      padding: '1rem',
                                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(0, 0, 0, 0.2)'
                                    }}>
                                      <a
                                        href={note.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          color: '#000000',
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
                                  color: 'rgba(0, 0, 0, 0.5)'
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
                                      color: '#000000',
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
                              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                              marginTop: '1rem'
                            }}
                          >
                            <div style={{
                              color: '#000000',
                              fontSize: '1.2rem',
                              fontWeight: '300',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}>
                              View all {userNotes.length} notes in Notes Page
                            </div>
                            <div style={{
                              color: 'rgba(0, 0, 0, 0.5)',
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
                              stroke="#000000"
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

                {activeTab === 'settings' && (
                  <div>
                    <h4 style={{
                      color: '#000000',
                      fontSize: '3rem',
                      fontWeight: '300',
                      margin: '0 0 3rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      Settings
                    </h4>

                    {isEditingProfile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '600px' }}>
                        <div>
                          <label style={{
                            color: 'rgba(0, 0, 0, 0.8)',
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
                              border: '1px solid rgba(0, 0, 0, 0.3)',
                              borderRadius: '0',
                              color: '#000000',
                              fontSize: '1.2rem',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{
                            color: 'rgba(0, 0, 0, 0.8)',
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
                              border: '1px solid rgba(0, 0, 0, 0.3)',
                              borderRadius: '0',
                              color: '#000000',
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
                              border: '1px solid rgba(0, 0, 0, 0.3)',
                              borderRadius: '0',
                              color: '#000000',
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
                              border: '1px solid #000000',
                              borderRadius: '0',
                              color: '#000000',
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '700px' }}>
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
                            color: 'rgba(0, 0, 0, 0.8)',
                            fontSize: '1rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            marginBottom: '0.8rem'
                          }}>
                            Display name
                          </div>
                          <div style={{
                            color: '#000000',
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
                            color: 'rgba(0, 0, 0, 0.8)',
                            fontSize: '1rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            marginBottom: '0.8rem'
                          }}>
                            Email address
                          </div>
                          <div style={{
                            color: '#000000',
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
                            color: 'rgba(0, 0, 0, 0.8)',
                            fontSize: '1rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            marginBottom: '0.8rem'
                          }}>
                            Login method
                          </div>
                          <div style={{
                            color: '#000000',
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
                            color: 'rgba(0, 0, 0, 0.8)',
                            fontSize: '1rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            marginBottom: '0.8rem'
                          }}>
                            User ID
                          </div>
                          <div style={{
                            color: 'rgba(0, 0, 0, 0.7)',
                            fontSize: '0.9rem',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            letterSpacing: '0.5px',
                            wordBreak: 'break-all'
                          }}>
                            {user.uid}
                          </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                          <motion.button
                            onClick={() => setShowDeleteAccountModal(true)}
                            style={{
                              width: '100%',
                              padding: '1.5rem',
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(0, 0, 0, 0.3)',
                              borderRadius: '0',
                              color: '#000000',
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

                {activeTab === 'help' && (
                  <div>
                    <h4 style={{
                      color: '#000000',
                      fontSize: '3rem',
                      fontWeight: '300',
                      margin: '0 0 3rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      Help
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '800px' }}>
                      <div style={{ padding: '2.5rem', backgroundColor: 'transparent', borderRadius: '0', border: 'none' }}>
                        <h5 style={{
                          color: '#000000',
                          fontSize: '1.5rem',
                          fontWeight: '300',
                          margin: '0 0 1.5rem 0',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          Getting started
                        </h5>
                        <p style={{
                          color: 'rgba(0, 0, 0, 0.8)',
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          Welcome to MENURU. This platform helps you organize your creative journey. Start by creating notes, exploring features, and customizing your profile.
                        </p>
                      </div>
                      <div style={{ padding: '2.5rem', backgroundColor: 'transparent', borderRadius: '0', border: 'none' }}>
                        <h5 style={{
                          color: '#000000',
                          fontSize: '1.5rem',
                          fontWeight: '300',
                          margin: '0 0 1.5rem 0',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          Features guide
                        </h5>
                        <p style={{
                          color: 'rgba(0, 0, 0, 0.8)',
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
                          border: '1px solid rgba(0, 0, 0, 0.3)',
                          borderRadius: '0',
                          color: '#000000',
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

                {activeTab === 'feedback' && (
                  <div>
                    <h4 style={{
                      color: '#000000',
                      fontSize: '3rem',
                      fontWeight: '300',
                      margin: '0 0 3rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      Feedback
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '800px' }}>
                      <div style={{ padding: '2.5rem', backgroundColor: 'transparent', borderRadius: '0', border: 'none' }}>
                        <h5 style={{
                          color: '#000000',
                          fontSize: '1.5rem',
                          fontWeight: '300',
                          margin: '0 0 1.5rem 0',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          Share your thoughts
                        </h5>
                        <p style={{
                          color: 'rgba(0, 0, 0, 0.8)',
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
                          border: '1px solid rgba(0, 0, 0, 0.3)',
                          borderRadius: '0',
                          color: '#000000',
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
                      <div style={{ padding: '2.5rem', backgroundColor: 'transparent', borderRadius: '0', border: 'none', marginTop: '1rem' }}>
                        <h5 style={{
                          color: '#000000',
                          fontSize: '1.5rem',
                          fontWeight: '300',
                          margin: '0 0 1.5rem 0',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.5px'
                        }}>
                          Contact support
                        </h5>
                        <p style={{
                          color: 'rgba(0, 0, 0, 0.8)',
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
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            borderRadius: '0',
                            color: '#000000',
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
              backgroundColor: 'rgba(219, 214, 201, 0.98)',
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
                backgroundColor: '#dbd6c9',
                borderRadius: '0',
                padding: '2.5rem',
                width: isMobile ? '90%' : '500px',
                maxWidth: '600px',
                border: '1px solid rgba(0, 0, 0, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 style={{
                color: '#000000',
                fontSize: '1.3rem',
                fontWeight: '300',
                margin: '0 0 1.5rem 0',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '0.5px'
              }}>
                Delete account
              </h4>
              <p style={{
                color: 'rgba(0, 0, 0, 0.8)',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: '0 0 2rem 0',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                Are you sure you want to delete your account? This action cannot be undone. 
                All your notes and data will be permanently deleted.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end' }}>
                <motion.button
                  onClick={() => setShowDeleteAccountModal(false)}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: '0',
                    color: '#000000',
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
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: '0',
                    color: '#000000',
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
              backgroundColor: 'rgba(219, 214, 201, 0.98)',
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
                backgroundColor: '#dbd6c9',
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
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{
                  color: '#000000',
                  fontSize: isMobile ? '2rem' : '2.5rem',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '0.5px'
                }}>
                  Logout
                </h3>
                <p style={{
                  color: 'rgba(0, 0, 0, 0.8)',
                  fontSize: '1.1rem',
                  margin: 0,
                  lineHeight: 1.6,
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  Are you sure you want to logout from {userDisplayName}?
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
                <motion.button
                  onClick={handleCancelLogout}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#000000',
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
                <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }} />
                <motion.button
                  onClick={handleConfirmLogout}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#000000',
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
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <p style={{
                  color: 'rgba(0, 0, 0, 0.5)',
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
              backgroundColor: '#dbd6c9',
              zIndex: 9995,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transform: 'translateY(-100%)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `radial-gradient(circle at 30% 40%, rgba(0,0,0,0.02) 0%, transparent 40%),
                                radial-gradient(circle at 70% 60%, rgba(0,0,0,0.02) 0%, transparent 40%),
                                repeating-linear-gradient(45deg, rgba(0,0,0,0.005) 0px, rgba(0,0,0,0.005) 2px, transparent 2px, transparent 12px)`,
              pointerEvents: 'none',
              zIndex: 1
            }} />

            <div style={{
              position: 'absolute',
              top: isMobile ? '1.5rem' : '2rem',
              left: 0,
              right: 0,
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              padding: isMobile ? '0 2rem' : '0 4rem',
              boxSizing: 'border-box',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <div style={{
                color: '#000000',
                fontSize: isMobile ? '1.2rem' : '1.8rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '1px',
                opacity: 0.9,
                textShadow: '0 0 10px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifySelf: 'start'
              }}>
                <span style={{ fontSize: isMobile ? '1.2rem' : '1.8rem', fontWeight: '300' }}>JAKARTA</span>
                <span style={{ fontSize: isMobile ? '1.2rem' : '1.8rem', fontWeight: '300', marginTop: '0.2rem' }}>{jakartaTime}</span>
              </div>

              <div style={{
                color: '#000000',
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                opacity: 0.9,
                textShadow: '0 0 20px rgba(0,0,0,0.5)',
                justifySelf: 'center'
              }}>
                MENURU
              </div>

              <div style={{ justifySelf: 'end' }}></div>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '10%',
              left: 0,
              width: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              zIndex: 2
            }}>
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  fontSize: isMobile ? '6rem' : '12rem',
                  fontWeight: '300',
                  color: '#000000',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '8px',
                  lineHeight: 1,
                  opacity: 0.7,
                  textShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
                  filter: 'brightness(1.3)'
                }}
              >
                MENU <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2rem', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
                  <path d="M7 7h10v10" />
                  <path d="M17 7L7 17" />
                </svg> MENU <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2rem', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
                  <path d="M7 7h10v10" />
                  <path d="M17 7L7 17" />
                </svg> MENU <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2rem', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
                  <path d="M7 7h10v10" />
                  <path d="M17 7L7 17" />
                </svg>
              </motion.div>
            </div>

            <div style={{
              position: 'absolute',
              top: '15%',
              bottom: '15%',
              left: 0,
              right: 0,
              zIndex: 3,
              display: 'flex',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '1200px',
                padding: isMobile ? '0 2rem' : '0 4rem',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                position: 'relative',
                height: '100%'
              }}>
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '2rem'
                }}>
                  <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>
                    <div
                      onClick={() => handleToggleSection('catatan')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '1rem 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <span style={{
                          color: 'rgba(0, 0, 0, 0.5)',
                          fontSize: '2rem',
                          fontWeight: '300',
                          fontFamily: 'monospace'
                        }}>01</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/catatan');
                          }}
                          style={{
                            color: '#000000',
                            fontSize: isMobile ? '3rem' : '4.5rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            textShadow: '0 0 10px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                          }}
                        >
                          CATATAN
                        </span>
                      </div>
                      <div style={{
                        transform: openSection === 'catatan' ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <svg
                          width="50"
                          height="50"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#000000"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}
                        >
                          <path d="M7 7h10v10" />
                          <path d="M17 7L7 17" />
                        </svg>
                      </div>
                    </div>

                    {openSection === 'catatan' && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        marginLeft: '6rem',
                        marginTop: '0.5rem',
                        marginBottom: '1rem',
                      }}>
                        {[
                          { number: '01', title: 'Creative Process', url: '/catatan/creative' },
                          { number: '02', title: 'Design Thinking', url: '/catatan/design' },
                          { number: '03', title: 'UX Research', url: '/catatan/ux' },
                          { number: '04', title: 'Development', url: '/catatan/dev' }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => router.push(item.url)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1.5rem',
                              padding: '0.5rem 0',
                              cursor: 'pointer',
                              borderBottom: idx < 3 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                          >
                            <span style={{ color: 'rgba(0, 0, 0, 0.3)', fontSize: '0.9rem', fontFamily: 'monospace', width: '30px' }}>
                              {item.number}
                            </span>
                            <span style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.2rem', flex: 1, fontWeight: '300', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                              {item.title}
                            </span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2">
                              <path d="M7 7h10v10" />
                              <path d="M17 7L7 17" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>
                    <div
                      onClick={() => handleToggleSection('community')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '1rem 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <span style={{
                          color: 'rgba(0, 0, 0, 0.5)',
                          fontSize: '2rem',
                          fontWeight: '300',
                          fontFamily: 'monospace'
                        }}>02</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/community');
                          }}
                          style={{
                            color: '#000000',
                            fontSize: isMobile ? '3rem' : '4.5rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            textShadow: '0 0 10px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                          }}
                        >
                          COMMUNITY
                        </span>
                      </div>
                      <div style={{
                        transform: openSection === 'community' ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}>
                          <path d="M7 7h10v10" />
                          <path d="M17 7L7 17" />
                        </svg>
                      </div>
                    </div>

                    {openSection === 'community' && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        marginLeft: '6rem',
                        marginTop: '0.5rem',
                        marginBottom: '1rem',
                      }}>
                        {[
                          { number: '01', title: 'Forum Diskusi', url: '/community/forum' },
                          { number: '02', title: 'Events', url: '/community/events' },
                          { number: '03', title: 'Members', url: '/community/members' },
                          { number: '04', title: 'Gallery', url: '/community/gallery' }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => router.push(item.url)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1.5rem',
                              padding: '0.5rem 0',
                              cursor: 'pointer',
                              borderBottom: idx < 3 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                          >
                            <span style={{ color: 'rgba(0, 0, 0, 0.3)', fontSize: '0.9rem', fontFamily: 'monospace', width: '30px' }}>{item.number}</span>
                            <span style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.2rem', flex: 1, fontWeight: '300', fontFamily: 'Helvetica, Arial, sans-serif' }}>{item.title}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2">
                              <path d="M7 7h10v10" />
                              <path d="M17 7L7 17" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>
                    <div
                      onClick={() => handleToggleSection('calendar')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '1rem 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <span style={{
                          color: 'rgba(0, 0, 0, 0.5)',
                          fontSize: '2rem',
                          fontWeight: '300',
                          fontFamily: 'monospace'
                        }}>03</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/calendar');
                          }}
                          style={{
                            color: '#000000',
                            fontSize: isMobile ? '3rem' : '4.5rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            textShadow: '0 0 10px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                          }}
                        >
                          CALENDAR
                        </span>
                      </div>
                      <div style={{
                        transform: openSection === 'calendar' ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}>
                          <path d="M7 7h10v10" />
                          <path d="M17 7L7 17" />
                        </svg>
                      </div>
                    </div>

                    {openSection === 'calendar' && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        marginLeft: '6rem',
                        marginTop: '0.5rem',
                        marginBottom: '1rem',
                      }}>
                        {[
                          { number: '01', title: 'Upcoming Events', url: '/calendar/upcoming' },
                          { number: '02', title: 'Workshops', url: '/calendar/workshops' },
                          { number: '03', title: 'Deadlines', url: '/calendar/deadlines' },
                          { number: '04', title: 'Schedule', url: '/calendar/schedule' }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => router.push(item.url)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1.5rem',
                              padding: '0.5rem 0',
                              cursor: 'pointer',
                              borderBottom: idx < 3 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                          >
                            <span style={{ color: 'rgba(0, 0, 0, 0.3)', fontSize: '0.9rem', fontFamily: 'monospace', width: '30px' }}>{item.number}</span>
                            <span style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.2rem', flex: 1, fontWeight: '300', fontFamily: 'Helvetica, Arial, sans-serif' }}>{item.title}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2">
                              <path d="M7 7h10v10" />
                              <path d="M17 7L7 17" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}>
                    <div
                      onClick={() => handleToggleSection('blog')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '1rem 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <span style={{
                          color: 'rgba(0, 0, 0, 0.5)',
                          fontSize: '2rem',
                          fontWeight: '300',
                          fontFamily: 'monospace'
                        }}>04</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/blog');
                          }}
                          style={{
                            color: '#000000',
                            fontSize: isMobile ? '3rem' : '4.5rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            textShadow: '0 0 10px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                          }}
                        >
                          BLOG
                        </span>
                      </div>
                      <div style={{
                        transform: openSection === 'blog' ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}>
                          <path d="M7 7h10v10" />
                          <path d="M17 7L7 17" />
                        </svg>
                      </div>
                    </div>

                    {openSection === 'blog' && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        marginLeft: '6rem',
                        marginTop: '0.5rem',
                        marginBottom: '1rem',
                      }}>
                        {[
                          { number: '01', title: 'Latest Posts', url: '/blog/latest' },
                          { number: '02', title: 'Tutorials', url: '/blog/tutorials' },
                          { number: '03', title: 'News', url: '/blog/news' },
                          { number: '04', title: 'Insights', url: '/blog/insights' }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => router.push(item.url)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1.5rem',
                              padding: '0.5rem 0',
                              cursor: 'pointer',
                              borderBottom: idx < 3 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                          >
                            <span style={{ color: 'rgba(0, 0, 0, 0.3)', fontSize: '0.9rem', fontFamily: 'monospace', width: '30px' }}>{item.number}</span>
                            <span style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.2rem', flex: 1, fontWeight: '300', fontFamily: 'Helvetica, Arial, sans-serif' }}>{item.title}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2">
                              <path d="M7 7h10v10" />
                              <path d="M17 7L7 17" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
                    paddingBottom: '1rem'
                  }}>
                    <div
                      onClick={() => handleToggleSection('spotify')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '1rem 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <span style={{
                          color: 'rgba(0, 0, 0, 0.5)',
                          fontSize: '2rem',
                          fontWeight: '300',
                          fontFamily: 'monospace'
                        }}>05</span>
                        <span
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: '#000000',
                            fontSize: isMobile ? '3rem' : '4.5rem',
                            fontWeight: '300',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            textShadow: '0 0 10px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          SPOTIFY PLAYLIST
                        </span>
                      </div>
                      <div style={{
                        transform: openSection === 'spotify' ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}>
                          <path d="M7 7h10v10" />
                          <path d="M17 7L7 17" />
                        </svg>
                      </div>
                    </div>

                    {openSection === 'spotify' && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                        marginLeft: isMobile ? '2rem' : '6rem',
                        marginTop: '2rem',
                        marginBottom: '2rem',
                      }}>
                        {currentEmbedUrl && (
                          <div style={{ width: '100%', marginBottom: '2rem' }}>
                            <iframe
                              style={{ borderRadius: '12px', width: '100%', height: '152px' }}
                              src={currentEmbedUrl}
                              frameBorder="0"
                              allowFullScreen
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{
                            width: isMobile ? '80px' : '100px',
                            height: isMobile ? '80px' : '100px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(0,0,0,0.2)'
                          }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M8 11L12 8L16 11" strokeLinecap="round"/>
                              <path d="M8 15L12 12L16 15" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div>
                            <div style={{
                              color: 'rgba(0,0,0,0.6)',
                              fontSize: '0.9rem',
                              marginBottom: '0.3rem',
                              letterSpacing: '1px'
                            }}>
                              PLAYLIST • 5 LAGU
                            </div>
                            <div style={{
                              color: '#000000',
                              fontSize: isMobile ? '2rem' : '2.5rem',
                              fontWeight: '300',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}>
                              Lagu Kesukaan
                            </div>
                            <div style={{
                              color: 'rgba(0,0,0,0.6)',
                              fontSize: '0.9rem',
                              marginTop: '0.3rem'
                            }}>
                              Hanin Dhiya • Stand Here Alone
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{
                              color: 'rgba(0,0,0,0.8)',
                              fontSize: '1.2rem',
                              fontWeight: '300',
                              marginBottom: '1rem',
                              paddingBottom: '0.5rem',
                              borderBottom: '1px solid rgba(0,0,0,0.1)'
                            }}>
                              Hanin Dhiya
                            </div>
                            {favoriteTracks.filter(t => t.artist === 'Hanin Dhiya').map((track, idx) => (
                              <div
                                key={track.id}
                                onClick={() => playTrack(track)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1.5rem',
                                  padding: '1rem 0',
                                  cursor: 'pointer',
                                  borderBottom: idx < 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                                  backgroundColor: currentTrack === track.id ? 'rgba(0,0,0,0.03)' : 'transparent',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <span style={{
                                  color: 'rgba(0, 0, 0, 0.3)',
                                  fontSize: '1.2rem',
                                  fontWeight: '300',
                                  fontFamily: 'monospace',
                                  width: '30px'
                                }}>
                                  {idx + 1}
                                </span>
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                  backgroundColor: 'rgba(0,0,0,0.05)',
                                  flexShrink: 0
                                }}>
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(0,0,0,0.5)',
                                    fontSize: '1.5rem'
                                  }}>
                                    ♪
                                  </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    color: '#000000',
                                    fontSize: '1.5rem',
                                    fontWeight: '300',
                                    fontFamily: 'Helvetica, Arial, sans-serif',
                                    marginBottom: '0.2rem'
                                  }}>
                                    {track.title}
                                  </div>
                                  <div style={{
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    fontSize: '1rem',
                                    fontWeight: '300'
                                  }}>
                                    {track.artist}
                                  </div>
                                </div>
                                {currentTrack === track.id && (
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#000000',
                                    marginRight: '0.5rem'
                                  }} />
                                )}
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div>
                            <div style={{
                              color: 'rgba(0,0,0,0.8)',
                              fontSize: '1.2rem',
                              fontWeight: '300',
                              marginBottom: '1rem',
                              paddingBottom: '0.5rem',
                              borderBottom: '1px solid rgba(0,0,0,0.1)'
                            }}>
                              Stand Here Alone
                            </div>
                            {favoriteTracks.filter(t => t.artist === 'Stand Here Alone').map((track, idx) => (
                              <div
                                key={track.id}
                                onClick={() => playTrack(track)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1.5rem',
                                  padding: '1rem 0',
                                  cursor: 'pointer',
                                  borderBottom: idx < 2 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                                  backgroundColor: currentTrack === track.id ? 'rgba(0,0,0,0.03)' : 'transparent',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <span style={{
                                  color: 'rgba(0, 0, 0, 0.3)',
                                  fontSize: '1.2rem',
                                  fontWeight: '300',
                                  fontFamily: 'monospace',
                                  width: '30px'
                                }}>
                                  {idx + 1}
                                </span>
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                  backgroundColor: 'rgba(0,0,0,0.05)',
                                  flexShrink: 0
                                }}>
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(0,0,0,0.5)',
                                    fontSize: '1.5rem'
                                  }}>
                                    ♪
                                  </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    color: '#000000',
                                    fontSize: '1.5rem',
                                    fontWeight: '300',
                                    fontFamily: 'Helvetica, Arial, sans-serif',
                                    marginBottom: '0.2rem'
                                  }}>
                                    {track.title}
                                  </div>
                                  <div style={{
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    fontSize: '1rem',
                                    fontWeight: '300'
                                  }}>
                                    {track.artist}
                                  </div>
                                </div>
                                {currentTrack === track.id && (
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#000000',
                                    marginRight: '0.5rem'
                                  }} />
                                )}
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {!currentEmbedUrl && (
                          <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'rgba(0,0,0,0.5)',
                            fontSize: '1rem',
                            border: '1px dashed rgba(0,0,0,0.2)',
                            borderRadius: '8px'
                          }}>
                            Pilih lagu di atas untuk memutar
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginTop: '2rem',
                          paddingTop: '1rem',
                          borderTop: '1px solid rgba(0,0,0,0.1)'
                        }}>
                          <a
                            href="https://open.spotify.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'rgba(0,0,0,0.8)',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 0',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Buka di Spotify
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              position: 'absolute',
              bottom: isMobile ? '2rem' : '3rem',
              left: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              padding: isMobile ? '0 2rem' : '0 4rem',
              boxSizing: 'border-box',
              color: 'rgba(0, 0, 0, 0.9)',
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '300',
              fontFamily: 'Helvetica, Arial, sans-serif',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <span>© 2024 MENURU</span>
                <span>All rights reserved</span>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>IG</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>TW</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>GH</a>
              </div>
            </div>

            <div
              onClick={handleCloseMenu}
              style={{
                position: 'absolute',
                top: isMobile ? '1.5rem' : '2rem',
                right: isMobile ? '1.5rem' : '2rem',
                color: '#000000',
                fontSize: isMobile ? '2.5rem' : '3rem',
                fontWeight: '300',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif',
                zIndex: 20,
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.9,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '1px solid rgba(0, 0, 0, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                textShadow: '0 0 15px rgba(0,0,0,0.5)',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)'
              }}
            >
              ×
            </div>
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
              backgroundColor: '#dbd6c9',
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
              backgroundColor: '#dbd6c9',
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
                    color: '#000000',
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
                    color: '#000000',
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
                      style={{ display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{
                        color: '#000000',
                        fontSize: isMobile ? '1.2rem' : '1.8rem',
                        fontWeight: '500',
                        fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        letterSpacing: '1px',
                        marginBottom: '0.8rem'
                      }}>
                        {role.title}
                      </div>
                      <div style={{
                        color: '#000000',
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
                    color: '#000000',
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
                    border: '1px solid rgba(0,0,0,0.2)',
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
                      e.currentTarget.style.backgroundColor = '#ddd';
                      e.currentTarget.style.display = 'flex';
                      e.currentTarget.style.alignItems = 'center';
                      e.currentTarget.style.justifyContent = 'center';
                      e.currentTarget.style.color = '#000';
                      e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Menuru Image</div>';
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  style={{
                    color: '#000000',
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
                  style={{ alignSelf: 'flex-start', marginBottom: isMobile ? '5rem' : '6rem' }}
                >
                  <motion.a
                    href="/explore"
                    style={{
                      color: '#000000',
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
                    color: '#000000',
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
                  border: '1px solid rgba(0, 0, 0, 0.3)'
                }}
              >
                <div 
                  ref={backslashRef}
                  style={{
                    position: 'absolute',
                    width: isMobile ? '30px' : '35px',
                    height: '4px',
                    backgroundColor: '#000000',
                    borderRadius: '2px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'center'
                  }}
                />
              </motion.div>
            </div>

            <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1, duration: 1 }}
                style={{
                  color: '#000000',
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
              backgroundColor: '#dbd6c9',
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
              backgroundColor: '#dbd6c9',
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}>
              <motion.button
                onClick={handleClosePhotoFullPage}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#000000',
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
                color: '#000000',
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

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
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
                        border: '1px solid rgba(0,0,0,0.2)',
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
                          e.currentTarget.style.backgroundColor = '#ddd';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = '#000';
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
                      backgroundColor: index === currentPhotoIndex ? '#000000' : 'rgba(0,0,0,0.2)',
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
                color: 'rgba(0,0,0,0.7)',
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
                  border: '1px solid rgba(0,0,0,0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1, position: 'relative' }}>
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
                          border: '1px solid rgba(0,0,0,0.2)',
                          borderRadius: '20px',
                          color: '#000000',
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
                        color: 'rgba(0,0,0,0.3)',
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
                        border: '1px solid rgba(0, 0, 0, 0.3)',
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
                        stroke="#000000" 
                        strokeWidth="2"
                      >
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </motion.button>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      color: 'rgba(0,0,0,0.5)',
                      fontSize: '0.75rem'
                    }}>
                      {user ? `Login sebagai: ${userDisplayName}` : 'Komentar sebagai: Anonymous'}
                    </span>
                  </div>
                </div>

                <div style={{
                  marginBottom: '1.5rem',
                  color: '#000000',
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
                      color: 'rgba(0,0,0,0.5)',
                      textAlign: 'center',
                      padding: '2rem',
                      fontSize: '0.9rem'
                    }}>
                      Memuat komentar...
                    </div>
                  ) : currentPhotoComments.length === 0 ? (
                    <div style={{
                      color: 'rgba(0,0,0,0.5)',
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
                          border: '1px solid rgba(0, 0, 0, 0.2)'
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
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#000000'
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
                                color: 'rgba(0,0,0,0.9)',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                              }}>
                                {comment.user}
                                {user && comment.user === userDisplayName && (
                                  <span style={{
                                    marginLeft: '0.5rem',
                                    fontSize: '0.7rem',
                                    backgroundColor: 'transparent',
                                    color: '#000000',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(0, 0, 0, 0.3)'
                                  }}>
                                    Anda
                                  </span>
                                )}
                              </span>
                              <span style={{
                                color: 'rgba(0,0,0,0.5)',
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap'
                              }}>
                                {calculateTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p style={{
                              color: '#000000',
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
              right: isMobile ? '1rem' : '2rem',
              backgroundColor: '#dbd6c9',
              backdropFilter: 'blur(20px)',
              borderRadius: '15px',
              padding: '1rem 0',
              width: isMobile ? '320px' : '450px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              zIndex: 1001,
              border: '1px solid rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '0 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <h3 style={{
                color: '#000000',
                fontSize: '1.3rem',
                fontWeight: '600',
                margin: 0,
                fontFamily: 'Helvetica, Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Notifications
                {notificationCount > 0 && (
                  <motion.span
                    key={notificationCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#000000',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      padding: '0.1rem 0.6rem',
                      borderRadius: '10px',
                      marginLeft: '0.5rem',
                      border: '1px solid rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </motion.span>
                )}
              </h3>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {notifications.length > 0 && hasUnreadNotifications && (
                  <motion.button
                    onClick={handleClearNotification}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(0, 0, 0, 0.3)',
                      color: '#000000',
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
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    color: '#000000',
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
                  color: 'rgba(0, 0, 0, 0.7)',
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
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
                    🔔
                  </div>
                  <h4 style={{
                    color: 'rgba(0, 0, 0, 0.9)',
                    fontSize: '1.2rem',
                    margin: '0 0 0.5rem 0'
                  }}>
                    No notifications yet
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    margin: '0 0 1.5rem 0',
                    color: 'rgba(0, 0, 0, 0.6)'
                  }}>
                    Check back later for updates
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification, index) => {
                    const currentUser = auth?.currentUser;
                    const currentUserId = currentUser ? currentUser.uid : 
                                          localStorage.getItem('anonymous_user_id') || 
                                          'anonymous_' + Date.now();
                    const isReadByUser = notification.userReads[currentUserId] || 
                                        (currentUser && notification.userReads[currentUser.uid]) || 
                                        false;
                    return (
                      <motion.div
                        key={notification.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          padding: '1rem 1.5rem',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: isReadByUser ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
                          position: 'relative'
                        }}
                        onClick={() => handleNotificationClick(notification)}
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
                      >
                        {!isReadByUser && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            style={{
                              position: 'absolute',
                              left: '0.5rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '8px',
                              height: '8px',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              borderRadius: '50%'
                            }}
                          />
                        )}
                        
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            color: '#000000'
                          }}>
                            {getIconByType(notification.type)}
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <h4 style={{
                                  color: '#000000',
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  margin: 0,
                                  fontFamily: 'Helvetica, Arial, sans-serif'
                                }}>
                                  {notification.title}
                                </h4>
                                <span style={{
                                  backgroundColor: 'transparent',
                                  color: '#000000',
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                  padding: '0.1rem 0.5rem',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase',
                                  border: '1px solid rgba(0, 0, 0, 0.3)'
                                }}>
                                  {notification.type}
                                </span>
                              </div>
                              <span style={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap'
                              }}>
                                {calculateTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                            
                            <p style={{
                              color: isReadByUser ? 'rgba(0, 0, 0, 0.8)' : '#000000',
                              fontSize: '0.9rem',
                              margin: '0 0 0.5rem 0',
                              lineHeight: 1.4,
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              wordBreak: 'break-word'
                            }}>
                              {notification.message}
                            </p>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginTop: '0.3rem'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: 'rgba(0, 0, 0, 0.5)',
                                fontSize: '0.75rem'
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                  <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <span>{notification.senderName}</span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: 'rgba(0, 0, 0, 0.5)',
                                fontSize: '0.75rem'
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <span>{notification.views || 0} views</span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: 'rgba(0, 0, 0, 0.5)',
                                fontSize: '0.75rem'
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                                <span>{(notification.likes?.length || 0)}</span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: 'rgba(0, 0, 0, 0.5)',
                                fontSize: '0.75rem'
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span>{(notification.comments?.length || 0)}</span>
                              </div>
                            </div>
                            
                            {notification.hasLinks && (
                              <div style={{
                                marginTop: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: 'rgba(0,0,0,0.5)',
                                fontSize: '0.7rem'
                              }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                </svg>
                                <span>{notification.linkCount} link{notification.linkCount !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              backgroundColor: 'transparent'
            }}>
              <div style={{
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.8rem',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                {notifications.length} total • {notificationCount} unread
              </div>
              
              <motion.a
                href="/notifications"
                style={{
                  color: '#000000',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                whileHover={{ gap: '0.8rem' }}
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
              backgroundColor: '#dbd6c9',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '0.8rem 0',
              minWidth: '200px',
              zIndex: 1001,
              border: '1px solid rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '0.8rem 1rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#000000',
                flexShrink: 0
              }}>
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: '#000000',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {userDisplayName}
                </div>
                <div style={{
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontSize: '0.75rem',
                  marginTop: '0.2rem'
                }}>
                  {user.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0' }}>
              <motion.button
                onClick={handleNotesClick}
                style={{
                  padding: '0.8rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgba(0, 0, 0, 0.9)',
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
                  color: '#000000',
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

      {/* Top Navigation Bar - Tanpa warna kuning, transparan */}
      <div 
        ref={topNavRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          padding: isMobile ? '1rem 1.5rem' : '1.5rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 101,
          boxSizing: 'border-box',
          backgroundColor: 'transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '2rem' : '4rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '300',
              fontFamily: 'Helvetica, Arial, sans-serif',
              letterSpacing: '2px',
              color: '#000000',
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
                    style={{ display: 'inline-block' }}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '1.5rem' : '2.5rem' }}>
            <motion.span
              onClick={() => router.push('/docs')}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Docs
            </motion.span>

            <motion.span
              onClick={() => router.push('/update')}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Update
            </motion.span>

            <motion.span
              onClick={() => router.push('/timeline')}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Timeline
            </motion.span>

            <motion.span
              onClick={() => router.push('/chatbot')}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Chatbot
            </motion.span>

            <motion.span
              onClick={handleCommunityClick}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Community
            </motion.span>

            <motion.span
              onClick={handleNewsClick}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              News
            </motion.span>

            <motion.span
              onClick={handleStoriesClick}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Stories
            </motion.span>

            <motion.span
              onClick={handleNoteClick}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Note
            </motion.span>

            <motion.span
              onClick={() => setShowCalendarModal(true)}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Calendar
            </motion.span>

            <motion.span
              onClick={handleOpenMenu}
              style={{
                color: '#000000',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '300',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'opacity 0.3s ease'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              whileHover={{ opacity: 0.7 }}
            >
              Menu
            </motion.span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Icon Notifikasi - Transparan tanpa background warna */}
          <motion.div
            ref={notificationRef}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.25, duration: 0.5 }}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: '1px solid rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowNotification(!showNotification)}
            whileHover={{ 
              scale: 1.1,
              borderColor: 'rgba(0,0,0,0.6)',
              backgroundColor: 'rgba(0,0,0,0.03)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#000000"
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
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #dbd6c9'
                }}
              >
                <span style={{
                  color: '#dbd6c9',
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

          {/* Tombol SIGN IN - Transparan tanpa warna kuning */}
          <motion.div
            onClick={handleSignInClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(0,0,0,0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: 'rgba(0,0,0,0.03)',
              borderColor: 'rgba(0,0,0,0.6)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{
              color: '#000000',
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '400',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              {user ? userDisplayName : 'SIGN IN'}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            >
              <path d="M7 17L17 7"/>
              <path d="M7 7h10v10"/>
            </svg>
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
            <div
              onClick={handleProductClick}
              style={{
                textAlign: 'left',
                height: isMobile ? '5rem' : '7rem',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <h2 style={{
                  color: '#000000',
                  fontSize: isMobile ? '5rem' : '7rem',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '-3px',
                  margin: 0,
                  lineHeight: 0.8,
                  padding: 0,
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                  PRODUCT
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                  <svg
                    width={isMobile ? "45" : "60"}
                    height={isMobile ? "45" : "60"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
                  >
                    <path d="M7 7L21 21" />
                    <path d="M21 7v14H7" />
                  </svg>
                  
                  <div style={{
                    position: 'relative',
                    width: isMobile ? '280px' : '350px',
                    height: isMobile ? '5rem' : '7rem',
                    overflow: 'hidden'
                  }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentRotatingWordIndex}
                        initial={{ y: 30, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -30, opacity: 0, scale: 0.9 }}
                        transition={{
                          y: { type: "spring", stiffness: 400, damping: 30 },
                          opacity: { duration: 0.4 },
                          scale: { duration: 0.3 }
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start'
                        }}
                      >
                        <h2 style={{
                          color: '#000000',
                          fontSize: isMobile ? '3.5rem' : '4.5rem',
                          fontWeight: '400',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '1px',
                          margin: 0,
                          lineHeight: 1,
                          textShadow: '0 0 20px rgba(0,0,0,0.5)',
                          whiteSpace: 'nowrap'
                        }}>
                          {rotatingWordsList[currentRotatingWordIndex]}
                        </h2>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '30px' }}
                transition={{ delay: 1.5 }}
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: 0,
                  height: '2px',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  width: '30px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
              <div style={{
                textAlign: 'center',
                height: isMobile ? '5rem' : '7rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <h2 style={{
                  color: '#000000',
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

              <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: isMobile ? '140px' : '180px',
                  height: isMobile ? '5rem' : '7rem',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  backgroundColor: '#ddd'
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
                  color: 'rgba(0, 0, 0, 0.7)',
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: isMobile ? '140px' : '180px',
                height: isMobile ? '5rem' : '7rem',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.3)',
                backgroundColor: '#ddd'
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
                color: 'rgba(0, 0, 0, 0.7)',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '400',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '1px'
              }}>
                02
              </div>
            </div>

            <div
              onClick={handleVisualDesignerClick}
              style={{
                textAlign: 'left',
                height: isMobile ? '5rem' : '7rem',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <h2 style={{
                color: '#000000',
                fontSize: isMobile ? '5rem' : '7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '-3px',
                margin: 0,
                lineHeight: 0.8,
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}>
                VISUAL DESIGNER
              </h2>
            </div>
          </div>

          {/* Baris 3: BASED + Foto + IN + PANTAU (Donasi Kamu) - Tanpa linebox */}
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
                color: '#000000',
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

            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: isMobile ? '140px' : '180px',
                height: isMobile ? '5rem' : '7rem',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.3)',
                backgroundColor: '#ddd'
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
                color: 'rgba(0, 0, 0, 0.7)',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '400',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '1px'
              }}>
                03
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '1rem' : '2rem'
            }}>
              <div style={{
                textAlign: 'right',
                height: isMobile ? '5rem' : '7rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <h2 style={{
                  color: '#000000',
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

              {/* Tombol PANTAU dengan SOUTH WEST ARROW dan teks "Donasi Kamu" - Tanpa linebox, font sama seperti nama website */}
              <motion.div
                onClick={handleDonasiTrackingClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  cursor: 'pointer',
                  padding: isMobile ? '0.5rem 1rem' : '0.8rem 1.5rem',
                  border: 'none',
                  borderRadius: '0',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ 
                  opacity: 0.7,
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{
                  color: '#000000',
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                  fontWeight: '400',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '1px'
                }}>
                  PANTAU
                </span>
                {/* SOUTH WEST ARROW SVG */}
                <svg
                  width={isMobile ? "24" : "28"}
                  height={isMobile ? "24" : "28"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 7L7 17" />
                  <path d="M7 7h10v10" />
                </svg>
                <span style={{
                  color: 'rgba(0,0,0,0.7)',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '400',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '0.5px'
                }}>
                  Donasi Kamu
                </span>
              </motion.div>
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: isMobile ? '140px' : '180px',
                height: isMobile ? '5rem' : '7rem',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.3)',
                backgroundColor: '#ddd'
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
                color: 'rgba(0, 0, 0, 0.7)',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '400',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '1px'
              }}>
                04
              </div>
            </div>

            <div
              onClick={handleIndonesiaClick}
              style={{
                textAlign: 'left',
                height: isMobile ? '5rem' : '7rem',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <h2 style={{
                color: '#000000',
                fontSize: isMobile ? '5rem' : '7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '-3px',
                margin: 0,
                lineHeight: 0.8,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}>
                INDONESIA
              </h2>
            </div>
          </div>
        </div>
        
        <div style={{ height: isMobile ? '3rem' : '4rem', width: '100%' }} />

        <AnimatePresence mode="wait">
          {currentView === "main" && (
            <motion.div
              key="main-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
                </AnimatePresence>
      </div>
    </div>
  )}
</div>
</div>
  );
}
