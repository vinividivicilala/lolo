'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  Timestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  onSnapshot,
  increment
} from "firebase/firestore";

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

// Instagram Verified Badge Component
const InstagramVerifiedBadge = ({ size = 18 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: '4px',
        cursor: 'help'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#0095F6"
          d="M12 2.2 C13.6 3.8 16.2 3.8 17.8 2.2 C18.6 3.8 20.2 5.4 21.8 6.2 C20.2 7.8 20.2 10.4 21.8 12 C20.2 13.6 20.2 16.2 21.8 17.8 C20.2 18.6 18.6 20.2 17.8 21.8 C16.2 20.2 13.6 20.2 12 21.8 C10.4 20.2 7.8 20.2 6.2 21.8 C5.4 20.2 3.8 18.6 2.2 17.8 C3.8 16.2 3.8 13.6 2.2 12 C3.8 10.4 3.8 7.8 2.2 6.2 C3.8 5.4 5.4 3.8 6.2 2.2 C7.8 3.8 10.4 3.8 12 2.2 Z"
        />
        <path d="M9.2 12.3l2 2 4.6-4.6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1a1a1a',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          marginBottom: '6px',
          zIndex: 1000
        }}>
          Akun Resmi
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '4px',
            borderStyle: 'solid',
            borderColor: '#1a1a1a transparent transparent transparent'
          }} />
        </div>
      )}
    </span>
  );
};

// Arrow Icons - Clear and Proper Shapes
const NorthEastArrow = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7 L17 7 L17 17" />
    <path d="M17 7 L7 17" />
  </svg>
);

const NorthWestArrow = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 7 L7 7 L7 17" />
    <path d="M7 7 L17 17" />
  </svg>
);

const SouthEastArrow = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 L17 17 L17 7" />
    <path d="M17 17 L7 7" />
  </svg>
);

const SouthWestArrow = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 17 L7 17 L7 7" />
    <path d="M7 17 L17 7" />
  </svg>
);

// Icons
const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const HeartIcon = ({ size = 20, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ff6b6b" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const SendIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const MoreIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
);

const CommentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ShareIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const CalendarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const BookOpenIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const TimeIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

// Types
interface Donor {
  id: string;
  userId: string;
  name: string;
  email: string;
  amount: number;
  message: string;
  createdAt: Date;
}

interface Comment {
  id: string;
  userId: string;
  name: string;
  email: string;
  text: string;
  createdAt: Date;
}

interface Story {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  content: string;
  images?: string[];
  likes: string[];
  comments: Comment[];
  createdAt: Date;
}

interface DonationEvent {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhoto?: string;
  location: string;
  endDate: Date;
  createdAt: Date;
  likes: string[];
  comments: Comment[];
  donors: Donor[];
  stories?: Story[];
}

export default function DonationPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  
  // Firebase State
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [firebaseDb, setFirebaseDb] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk Events
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DonationEvent | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newCommentEventId, setNewCommentEventId] = useState<string | null>(null);
  
  // State untuk Create Event
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    targetAmount: "",
    location: "",
    endDate: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk Story
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedEventForStory, setSelectedEventForStory] = useState<DonationEvent | null>(null);
  const [storyContent, setStoryContent] = useState("");
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [storyComments, setStoryComments] = useState<{[key: string]: string}>({});
  
  // State untuk animasi
  const [animateDonation, setAnimateDonation] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'feed' | 'stories'>('feed');

  // Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number dengan titik
  const formatNumberWithDots = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse number dari format titik
  const parseNumberFromDots = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  // Format tanggal
  const formatDate = (date: any) => {
    if (!date) return "Baru saja";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return "Baru saja";
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return "Baru saja";
    }
  };

  // Format waktu relatif
  const formatTime = (date: any) => {
    if (!date) return "Baru saja";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
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
      return formatDate(d);
    } catch {
      return "Baru saja";
    }
  };

  // Hitung persentase
  const getPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.floor((current / target) * 100), 100);
  };

  // Hitung sisa hari
  const getDaysRemaining = (endDate: any) => {
    if (!endDate) return 0;
    try {
      const d = endDate.toDate ? endDate.toDate() : new Date(endDate);
      if (isNaN(d.getTime())) return 0;
      const today = new Date();
      const diffTime = d.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
    }
  };

  // Create Event
  const handleCreateEvent = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    
    if (!newEvent.title.trim() || !newEvent.description.trim()) {
      alert("Judul dan deskripsi harus diisi");
      return;
    }
    
    const targetAmount = parseNumberFromDots(newEvent.targetAmount);
    if (targetAmount < 1) {
      alert("Target donasi harus diisi");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const eventData = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        targetAmount: targetAmount,
        currentAmount: 0,
        organizerId: user.uid,
        organizerName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        organizerEmail: user.email,
        organizerPhoto: user.photoURL,
        location: newEvent.location.trim() || 'Online',
        endDate: newEvent.endDate ? new Date(newEvent.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        likes: [],
        comments: [],
        donors: [],
        stories: []
      };
      
      const eventsRef = collection(firebaseDb, 'donationEvents');
      const docRef = await addDoc(eventsRef, {
        ...eventData,
        createdAt: Timestamp.fromDate(eventData.createdAt),
        endDate: Timestamp.fromDate(eventData.endDate)
      });
      
      setEvents([{ id: docRef.id, ...eventData }, ...events]);
      setShowCreateModal(false);
      setNewEvent({ title: "", description: "", targetAmount: "", location: "", endDate: "" });
      setSuccessMessage("Kegiatan berhasil dibuat!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Gagal membuat event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Story
  const handleCreateStory = async () => {
    if (!user || !selectedEventForStory) return;
    
    if (!storyContent.trim()) {
      alert("Tulis cerita terlebih dahulu");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const storyData = {
        id: `${Date.now()}_${user.uid}`,
        eventId: selectedEventForStory.id,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userEmail: user.email,
        userPhoto: user.photoURL,
        content: storyContent,
        images: storyImages,
        likes: [],
        comments: [],
        createdAt: new Date()
      };
      
      const eventRef = doc(firebaseDb, 'donationEvents', selectedEventForStory.id);
      await updateDoc(eventRef, {
        stories: arrayUnion(storyData)
      });
      
      setStoryContent("");
      setStoryImages([]);
      setShowStoryModal(false);
      setSelectedEventForStory(null);
      setSuccessMessage("Cerita berhasil dibagikan!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error creating story:", error);
      alert("Gagal membagikan cerita");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Donation
  const handleDonate = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    
    if (!selectedEvent) return;
    
    const amount = parseNumberFromDots(donationAmount);
    if (amount < 1) {
      alert("Masukkan nominal donasi yang valid");
      return;
    }
    
    if (!donationMessage.trim()) {
      alert("Silakan tulis pesan donasi");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const eventRef = doc(firebaseDb, 'donationEvents', selectedEvent.id);
      const newDonor = {
        id: `${Date.now()}_${user.uid}`,
        userId: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        amount: amount,
        message: donationMessage,
        createdAt: new Date()
      };
      
      await updateDoc(eventRef, {
        currentAmount: increment(amount),
        donors: arrayUnion(newDonor)
      });
      
      setDonationAmount("");
      setDonationMessage("");
      setShowDonateModal(false);
      setAnimateDonation(selectedEvent.id);
      setSuccessMessage(`Terima kasih atas donasi ${formatRupiah(amount)}!`);
      setShowSuccess(true);
      
      setTimeout(() => {
        setAnimateDonation(null);
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error donating:", error);
      alert("Gagal mengirim donasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Like for Event
  const handleLikeEvent = async (eventId: string) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    
    try {
      const eventRef = doc(firebaseDb, 'donationEvents', eventId);
      const event = events.find(e => e.id === eventId);
      
      if (event?.likes.includes(user.uid)) {
        await updateDoc(eventRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(eventRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error liking:", error);
    }
  };

  // Handle Like for Story
  const handleLikeStory = async (eventId: string, storyId: string) => {
    if (!user) return;
    
    try {
      const eventRef = doc(firebaseDb, 'donationEvents', eventId);
      const event = events.find(e => e.id === eventId);
      const story = event?.stories?.find(s => s.id === storyId);
      
      if (story?.likes.includes(user.uid)) {
        const updatedStories = event?.stories?.map(s => 
          s.id === storyId ? { ...s, likes: s.likes.filter(uid => uid !== user.uid) } : s
        );
        await updateDoc(eventRef, { stories: updatedStories });
      } else {
        const updatedStories = event?.stories?.map(s => 
          s.id === storyId ? { ...s, likes: [...s.likes, user.uid] } : s
        );
        await updateDoc(eventRef, { stories: updatedStories });
      }
    } catch (error) {
      console.error("Error liking story:", error);
    }
  };

  // Handle Comment for Event
  const handleCommentEvent = async (eventId: string) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      const eventRef = doc(firebaseDb, 'donationEvents', eventId);
      const newCommentData = {
        id: `${Date.now()}_${user.uid}`,
        userId: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        text: newComment,
        createdAt: new Date()
      };
      
      await updateDoc(eventRef, {
        comments: arrayUnion(newCommentData)
      });
      
      setNewComment("");
      setNewCommentEventId(null);
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  // Handle Comment for Story
  const handleCommentStory = async (eventId: string, storyId: string) => {
    if (!user) return;
    
    const commentText = storyComments[storyId];
    if (!commentText?.trim()) return;
    
    try {
      const eventRef = doc(firebaseDb, 'donationEvents', eventId);
      const event = events.find(e => e.id === eventId);
      const newCommentData = {
        id: `${Date.now()}_${user.uid}`,
        userId: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        text: commentText,
        createdAt: new Date()
      };
      
      const updatedStories = event?.stories?.map(s => 
        s.id === storyId ? { ...s, comments: [...s.comments, newCommentData] } : s
      );
      await updateDoc(eventRef, { stories: updatedStories });
      
      setStoryComments(prev => ({ ...prev, [storyId]: "" }));
    } catch (error) {
      console.error("Error commenting on story:", error);
    }
  };

  // Load Events
  useEffect(() => {
    if (!firebaseDb) return;
    
    const eventsRef = collection(firebaseDb, 'donationEvents');
    const q = query(eventsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          targetAmount: data.targetAmount || 0,
          currentAmount: data.currentAmount || 0,
          organizerId: data.organizerId || "",
          organizerName: data.organizerName || "",
          organizerEmail: data.organizerEmail || "",
          organizerPhoto: data.organizerPhoto || "",
          location: data.location || "",
          endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          likes: data.likes || [],
          comments: data.comments || [],
          donors: data.donors || [],
          stories: data.stories || []
        };
      });
      setEvents(eventsData);
    });
    
    return () => unsubscribe();
  }, [firebaseDb]);

  // Firebase Initialization
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const auth = getAuth(app);
      const db = getFirestore(app);
      
      setFirebaseAuth(auth);
      setFirebaseDb(db);
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auth State Listener
  useEffect(() => {
    if (!firebaseAuth) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [firebaseAuth]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    if (!firebaseAuth) return;
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (!firebaseAuth) return;
    
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ color: '#fff', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fff',
      padding: isMobile ? '16px' : '32px',
      paddingTop: isMobile ? '80px' : '100px',
    }}>
      
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000',
        borderBottom: '1px solid #222',
        zIndex: 100,
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '600',
          cursor: 'pointer',
          color: '#fff'
        }} onClick={() => router.push('/')}>
          Menuru
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: '1px solid #222',
                fontSize: '13px',
                color: '#fff',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '30px',
              }}
            >
              <PlusIcon size={16} />
              <span>Buat</span>
            </button>
          )}
          
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '30px',
              border: '1px solid #222',
            }}>
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=111&color=fff&size=28`} 
                alt={user.displayName}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <span style={{ fontSize: '13px', color: '#fff' }}>
                {user.displayName || user.email?.split('@')[0]?.slice(0, 10)}
              </span>
              <InstagramVerifiedBadge size={14} />
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#666',
                  cursor: 'pointer',
                }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              style={{
                padding: '8px 20px',
                background: 'none',
                border: '1px solid #222',
                borderRadius: '30px',
                fontSize: '13px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          )}
          
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            color: '#666',
            fontSize: '13px',
          }}>
            <NorthEastArrow size={14} color="#666" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
      }}>
        <h1 style={{
          fontSize: isMobile ? '32px' : '40px',
          fontWeight: '600',
          letterSpacing: '-0.5px',
          marginBottom: '12px',
          color: '#fff'
        }}>
          Berbagi Kebaikan
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          maxWidth: '450px',
          margin: '0 auto',
        }}>
          Buat kegiatan donasi, bagikan cerita, dan kumpulkan dukungan
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        marginBottom: '24px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #222',
      }}>
        <button
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            fontSize: '14px',
            fontWeight: activeTab === 'feed' ? '600' : '400',
            color: activeTab === 'feed' ? '#fff' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === 'feed' ? '2px solid #fff' : 'none',
          }}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            fontSize: '14px',
            fontWeight: activeTab === 'stories' ? '600' : '400',
            color: activeTab === 'stories' ? '#fff' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === 'stories' ? '2px solid #fff' : 'none',
          }}
        >
          Cerita
        </button>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {activeTab === 'feed' ? (
          // Feed Events
          <>
            {events.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
                border: '1px solid #222',
                borderRadius: '12px',
              }}>
                <p style={{ fontSize: '14px', marginBottom: '16px' }}>Belum ada kegiatan</p>
                {user && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      background: 'none',
                      border: '1px solid #222',
                      padding: '8px 20px',
                      borderRadius: '30px',
                      fontSize: '13px',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Buat kegiatan pertama
                  </button>
                )}
              </div>
            ) : (
              events.map((event) => {
                const isLiked = event.likes.includes(user?.uid);
                const percentage = getPercentage(event.currentAmount, event.targetAmount);
                const daysLeft = getDaysRemaining(event.endDate);
                const isAnimating = animateDonation === event.id;
                
                return (
                  <div
                    key={event.id}
                    style={{
                      marginBottom: '40px',
                      borderBottom: '1px solid #222',
                      paddingBottom: '32px',
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={event.organizerPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizerName)}&background=111&color=fff&size=36`}
                          alt={event.organizerName}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>
                              {event.organizerName}
                            </span>
                            <InstagramVerifiedBadge size={14} />
                          </div>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                            {formatTime(event.createdAt)} • {event.location}
                          </div>
                        </div>
                      </div>
                      <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                        <MoreIcon size={18} />
                      </button>
                    </div>
                    
                    {/* Title */}
                    <h2 style={{
                      fontSize: '22px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#fff'
                    }}>
                      {event.title}
                    </h2>
                    
                    {/* Description */}
                    <p style={{
                      fontSize: '14px',
                      color: '#888',
                      lineHeight: '1.5',
                      marginBottom: '20px',
                    }}>
                      {event.description}
                    </p>
                    
                    {/* Progress */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        marginBottom: '8px',
                        color: '#888',
                      }}>
                        <span>Terkumpul</span>
                        <span style={{ color: '#fff' }}>{formatRupiah(event.currentAmount)}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        marginBottom: '8px',
                        color: '#888',
                      }}>
                        <span>Target</span>
                        <span style={{ color: '#fff' }}>{formatRupiah(event.targetAmount)}</span>
                      </div>
                      <div style={{
                        height: '4px',
                        backgroundColor: '#222',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginTop: '12px',
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#fff',
                        }} />
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                        fontSize: '11px',
                        color: '#666',
                      }}>
                        <span>{percentage}% terkumpul</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CalendarIcon size={12} />
                          {daysLeft > 0 ? `${daysLeft} hari` : 'Selesai'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Animasi Donasi Baru */}
                    {isAnimating && (
                      <div style={{
                        padding: '10px',
                        background: '#111',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '12px',
                        color: '#fff',
                        border: '1px solid #222',
                        textAlign: 'center',
                      }}>
                        ✨ Donasi baru! Terima kasih ✨
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '24px',
                      padding: '12px 0',
                      borderTop: '1px solid #222',
                      borderBottom: '1px solid #222',
                    }}>
                      <button
                        onClick={() => handleLikeEvent(event.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          color: isLiked ? '#ff6b6b' : '#666',
                          cursor: 'pointer',
                        }}
                      >
                        <HeartIcon size={18} filled={isLiked} />
                        <span>{event.likes.length}</span>
                      </button>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          color: '#666',
                          cursor: 'pointer',
                        }}
                      >
                        <CommentIcon size={18} />
                        <span>{event.comments.length}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowDonateModal(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          color: '#fff',
                          cursor: 'pointer',
                          marginLeft: 'auto',
                        }}
                      >
                        <SendIcon size={16} />
                        <span>Donasi</span>
                        <NorthEastArrow size={14} color="#fff" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEventForStory(event);
                          setShowStoryModal(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          color: '#666',
                          cursor: 'pointer',
                        }}
                      >
                        <BookOpenIcon size={16} />
                        <span>Cerita</span>
                      </button>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                      }}>
                        <ShareIcon size={18} />
                      </button>
                    </div>
                    
                    {/* Donors List */}
                    {event.donors.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                          {event.donors.length} donatur
                        </div>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}>
                          {event.donors.slice(0, 5).map((donor) => (
                            <div key={donor.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#888',
                              background: '#111',
                              padding: '4px 10px',
                              borderRadius: '20px',
                            }}>
                              <span>{donor.name}</span>
                              <span>•</span>
                              <span style={{ color: '#fff' }}>{formatRupiah(donor.amount)}</span>
                            </div>
                          ))}
                          {event.donors.length > 5 && (
                            <span style={{ fontSize: '11px', color: '#666' }}>
                              +{event.donors.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Comments */}
                    {event.comments.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        {event.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} style={{
                            marginBottom: '8px',
                            fontSize: '12px',
                          }}>
                            <span style={{ fontWeight: '500', color: '#fff', marginRight: '6px' }}>{comment.name}</span>
                            <span style={{ color: '#888' }}>{comment.text}</span>
                            <span style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}>
                              {formatTime(comment.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Comment Input */}
                    {user && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '12px',
                      }}>
                        <input
                          type="text"
                          value={newCommentEventId === event.id ? newComment : ''}
                          onChange={(e) => {
                            setNewCommentEventId(event.id);
                            setNewComment(e.target.value);
                          }}
                          placeholder="Tulis komentar..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: '#111',
                            border: '1px solid #222',
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: '#fff',
                            outline: 'none',
                          }}
                        />
                        <button
                          onClick={() => handleCommentEvent(event.id)}
                          disabled={!newComment.trim()}
                          style={{
                            padding: '8px 16px',
                            background: 'none',
                            border: '1px solid #222',
                            borderRadius: '20px',
                            fontSize: '12px',
                            cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                            color: newComment.trim() ? '#fff' : '#444',
                          }}
                        >
                          Kirim
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        ) : (
          // Stories Tab
          <>
            {events.filter(event => event.stories && event.stories.length > 0).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
                border: '1px solid #222',
                borderRadius: '12px',
              }}>
                <BookOpenIcon size={32} stroke="#333" />
                <p style={{ fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>Belum ada cerita</p>
                <p style={{ fontSize: '12px', color: '#444' }}>Jadilah yang pertama berbagi cerita dari kegiatan donasi</p>
              </div>
            ) : (
              events.map((event) => (
                event.stories && event.stories.length > 0 && (
                  <div key={event.id} style={{ marginBottom: '32px' }}>
                    {/* Event Header */}
                    <div style={{
                      marginBottom: '20px',
                      padding: '16px',
                      background: '#111',
                      borderRadius: '12px',
                      border: '1px solid #222',
                    }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        color: '#fff'
                      }}>
                        {event.title}
                      </h3>
                      <p style={{ fontSize: '11px', color: '#666' }}>
                        {event.stories.length} cerita dibagikan
                      </p>
                    </div>
                    
                    {/* Stories List */}
                    {event.stories.map((story) => {
                      const isStoryLiked = story.likes.includes(user?.uid);
                      
                      return (
                        <div
                          key={story.id}
                          style={{
                            marginBottom: '24px',
                            padding: '20px',
                            background: '#0a0a0a',
                            borderRadius: '16px',
                            border: '1px solid #222',
                          }}
                        >
                          {/* Story Header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img 
                                src={story.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.userName)}&background=111&color=fff&size=32`}
                                alt={story.userName}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                }}
                              />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>
                                    {story.userName}
                                  </span>
                                  <InstagramVerifiedBadge size={12} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <TimeIcon size={10} />
                                  <span style={{ fontSize: '10px', color: '#666' }}>
                                    {formatTime(story.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                              <MoreIcon size={16} />
                            </button>
                          </div>
                          
                          {/* Story Content */}
                          <div style={{
                            fontSize: '13px',
                            lineHeight: '1.5',
                            color: '#ccc',
                            marginBottom: '16px',
                            whiteSpace: 'pre-wrap',
                          }}>
                            {story.content}
                          </div>
                          
                          {/* Story Actions */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '10px 0',
                            borderTop: '1px solid #222',
                            borderBottom: '1px solid #222',
                          }}>
                            <button
                              onClick={() => handleLikeStory(event.id, story.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'none',
                                border: 'none',
                                fontSize: '12px',
                                color: isStoryLiked ? '#ff6b6b' : '#666',
                                cursor: 'pointer',
                              }}
                            >
                              <HeartIcon size={16} filled={isStoryLiked} />
                              <span>{story.likes.length}</span>
                            </button>
                            <button
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'none',
                                border: 'none',
                                fontSize: '12px',
                                color: '#666',
                                cursor: 'pointer',
                              }}
                            >
                              <CommentIcon size={16} />
                              <span>{story.comments.length}</span>
                            </button>
                            <button style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              color: '#666',
                              cursor: 'pointer',
                              marginLeft: 'auto',
                            }}>
                              <ShareIcon size={16} />
                            </button>
                          </div>
                          
                          {/* Story Comments */}
                          {story.comments.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              {story.comments.slice(0, 2).map((comment) => (
                                <div key={comment.id} style={{
                                  marginBottom: '6px',
                                  fontSize: '11px',
                                }}>
                                  <span style={{ fontWeight: '500', color: '#fff', marginRight: '6px' }}>{comment.name}</span>
                                  <span style={{ color: '#888' }}>{comment.text}</span>
                                  <span style={{ fontSize: '9px', color: '#666', marginLeft: '6px' }}>
                                    {formatTime(comment.createdAt)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Story Comment Input */}
                          {user && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginTop: '12px',
                            }}>
                              <input
                                type="text"
                                value={storyComments[story.id] || ''}
                                onChange={(e) => setStoryComments(prev => ({ ...prev, [story.id]: e.target.value }))}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCommentStory(event.id, story.id);
                                  }
                                }}
                                placeholder="Balas cerita..."
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  background: '#111',
                                  border: '1px solid #222',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  color: '#fff',
                                  outline: 'none',
                                }}
                              />
                              <button
                                onClick={() => handleCommentStory(event.id, story.id)}
                                disabled={!storyComments[story.id]?.trim()}
                                style={{
                                  padding: '6px 12px',
                                  background: 'none',
                                  border: '1px solid #222',
                                  borderRadius: '20px',
                                  fontSize: '10px',
                                  cursor: storyComments[story.id]?.trim() ? 'pointer' : 'not-allowed',
                                  color: storyComments[story.id]?.trim() ? '#fff' : '#444',
                                }}
                              >
                                Kirim
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ))
            )}
          </>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            background: '#000',
            borderRadius: '20px',
            padding: '28px',
            maxWidth: '480px',
            width: '100%',
            border: '1px solid #222',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>Buat Kegiatan</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <CloseIcon size={20} />
              </button>
            </div>
            
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Judul kegiatan"
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '16px',
                color: '#fff',
                outline: 'none',
                marginBottom: '20px',
              }}
            />
            
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Deskripsi kegiatan"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '14px',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                marginBottom: '20px',
              }}
            />
            
            <input
              type="text"
              value={newEvent.targetAmount}
              onChange={(e) => setNewEvent({ ...newEvent, targetAmount: formatNumberWithDots(e.target.value) })}
              placeholder="Target donasi"
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '16px',
                color: '#fff',
                outline: 'none',
                marginBottom: '20px',
              }}
            />
            
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Lokasi"
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '16px',
                color: '#fff',
                outline: 'none',
                marginBottom: '20px',
              }}
            />
            
            <input
              type="date"
              value={newEvent.endDate}
              onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '16px',
                color: '#fff',
                outline: 'none',
                marginBottom: '24px',
              }}
            />
            
            <button
              onClick={handleCreateEvent}
              disabled={isSubmitting || !newEvent.title || !newEvent.description}
              style={{
                width: '100%',
                padding: '12px',
                background: '#fff',
                border: 'none',
                borderRadius: '30px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting || !newEvent.title || !newEvent.description ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !newEvent.title || !newEvent.description ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Membuat...' : 'Buat'}
            </button>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showStoryModal && selectedEventForStory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }} onClick={() => setShowStoryModal(false)}>
          <div style={{
            background: '#000',
            borderRadius: '20px',
            padding: '28px',
            maxWidth: '480px',
            width: '100%',
            border: '1px solid #222',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff' }}>Bagikan Cerita</h2>
              <button onClick={() => setShowStoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <CloseIcon size={18} />
              </button>
            </div>
            
            <p style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '20px',
              padding: '10px',
              background: '#111',
              borderRadius: '10px',
            }}>
              {selectedEventForStory.title}
            </p>
            
            <textarea
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              placeholder="Ceritakan pengalaman donasi Anda..."
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                marginBottom: '20px',
              }}
            />
            
            <button
              onClick={handleCreateStory}
              disabled={isSubmitting || !storyContent.trim()}
              style={{
                width: '100%',
                padding: '12px',
                background: '#fff',
                border: 'none',
                borderRadius: '30px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting || !storyContent.trim() ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !storyContent.trim() ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Membagikan...' : 'Bagikan Cerita'}
            </button>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }} onClick={() => setShowDonateModal(false)}>
          <div style={{
            background: '#000',
            borderRadius: '20px',
            padding: '28px',
            maxWidth: '420px',
            width: '100%',
            border: '1px solid #222',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff' }}>Kirim Donasi</h2>
              <button onClick={() => setShowDonateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <CloseIcon size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>
              {selectedEvent.title}
            </p>
            
            <input
              type="text"
              value={donationAmount}
              onChange={(e) => setDonationAmount(formatNumberWithDots(e.target.value))}
              placeholder="Jumlah donasi"
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '10px',
                fontSize: '16px',
                color: '#fff',
                outline: 'none',
                marginBottom: '16px',
              }}
            />
            
            <textarea
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
              placeholder="Pesan dukungan..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                marginBottom: '24px',
              }}
            />
            
            <button
              onClick={handleDonate}
              disabled={isSubmitting || !donationAmount || !donationMessage}
              style={{
                width: '100%',
                padding: '12px',
                background: '#fff',
                border: 'none',
                borderRadius: '30px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting || !donationAmount || !donationMessage ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !donationAmount || !donationMessage ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Memproses...' : 'Kirim'}
            </button>
          </div>
        </div>
      )}
      
      {/* Success Notification */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          color: '#000',
          padding: '10px 20px',
          borderRadius: '30px',
          fontSize: '12px',
          zIndex: 1001,
        }}>
          {successMessage}
        </div>
      )}
    </div>
  );
}
