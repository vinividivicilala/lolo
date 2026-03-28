'use client';

import React, { useState, useEffect, useRef } from "react";
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
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  where,
  addDoc,
  onSnapshot,
  increment
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

// Instagram Verified Badge Component - Minimalist
const VerifiedBadge = ({ size = 16 }) => {
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
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="7" fill="#1DA1F2" />
        <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
          fontSize: '11px',
          whiteSpace: 'nowrap',
          marginBottom: '6px',
          zIndex: 1000
        }}>
          Akun Terverifikasi
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

// Icons - Minimalist
const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const HeartIcon = ({ size = 20, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ImageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const SendIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const MoreIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
);

const CommentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ShareIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const CalendarIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const LocationIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ArrowIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="7" y1="7" x2="17" y2="17"/>
    <polyline points="17 7 17 17 7 17"/>
  </svg>
);

const NorthEastArrow = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 7L17 17" stroke="currentColor"/>
    <path d="M7 7H17" stroke="currentColor"/>
    <path d="M7 17V7" stroke="currentColor"/>
  </svg>
);

// Types
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
  imageUrl?: string;
  location: string;
  endDate: Date;
  createdAt: Date;
  likes: string[];
  comments: Comment[];
  donors: Donor[];
}

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

export default function DonationPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Firebase State
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [firebaseDb, setFirebaseDb] = useState<any>(null);
  const [firebaseStorage, setFirebaseStorage] = useState<any>(null);
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
  
  // State untuk Create Event
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    targetAmount: "",
    location: "",
    endDate: ""
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk animasi
  const [animateDonation, setAnimateDonation] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format Date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}j`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays}h`;
    return formatDate(date);
  };

  // Hitung persentase
  const getPercentage = (current: number, target: number) => {
    return Math.min(Math.floor((current / target) * 100), 100);
  };

  // Hitung sisa hari
  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Upload image ke Firebase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!firebaseStorage) return null;
    
    try {
      const storageRef = ref(firebaseStorage, `donation-images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
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
    
    const targetAmount = parseInt(newEvent.targetAmount);
    if (isNaN(targetAmount) || targetAmount < 10000) {
      alert("Target donasi minimal Rp 10.000");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      
      const eventData = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        targetAmount: targetAmount,
        currentAmount: 0,
        organizerId: user.uid,
        organizerName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        organizerEmail: user.email,
        organizerPhoto: user.photoURL,
        imageUrl: imageUrl,
        location: newEvent.location.trim() || 'Online',
        endDate: newEvent.endDate ? new Date(newEvent.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        likes: [],
        comments: [],
        donors: []
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
      setSelectedImage(null);
      setImagePreview(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Gagal membuat event");
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
    
    const amount = parseInt(donationAmount);
    if (isNaN(amount) || amount < 10000) {
      alert("Minimal donasi Rp 10.000");
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

  // Handle Like
  const handleLike = async (eventId: string) => {
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

  // Handle Comment
  const handleComment = async (eventId: string) => {
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
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  // Load Events
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;
    
    const eventsRef = collection(firebaseDb, 'donationEvents');
    const q = query(eventsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          endDate: data.endDate?.toDate?.() || new Date(),
          donors: data.donors || [],
          comments: data.comments || [],
          likes: data.likes || []
        };
      });
      setEvents(eventsData);
    });
    
    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized]);

  // Firebase Initialization
  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const auth = getAuth(app);
      const db = getFirestore(app);
      const storage = getStorage(app);
      
      setFirebaseAuth(auth);
      setFirebaseDb(db);
      setFirebaseStorage(storage);
      setFirebaseInitialized(true);
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auth State Listener
  useEffect(() => {
    if (!firebaseAuth || !firebaseInitialized) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [firebaseAuth, firebaseInitialized]);

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

  if (!isMounted || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#111',
      position: 'relative',
      padding: isMobile ? '16px' : '24px',
      paddingTop: isMobile ? '80px' : '100px',
    }}>
      
      {/* Header - Minimalist */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee',
        zIndex: 100,
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '500',
          letterSpacing: '-0.3px',
          cursor: 'pointer'
        }} onClick={() => router.push('/')}>
          Menuru
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Create Event Button */}
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#111',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '20px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <PlusIcon size={18} />
              <span>Buat Kegiatan</span>
            </button>
          )}
          
          {/* User Info */}
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 12px',
              borderRadius: '24px',
              border: '1px solid #eee',
            }}>
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=f5f5f5&color=666`} 
                alt={user.displayName}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: '500' }}>
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#999',
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
                padding: '8px 16px',
                background: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: '24px',
                fontSize: '13px',
                color: '#111',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              Login dengan Google
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
            <ArrowIcon size={14} />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
      }}>
        <h1 style={{
          fontSize: isMobile ? '32px' : '48px',
          fontWeight: '500',
          letterSpacing: '-1px',
          marginBottom: '12px',
          color: '#111'
        }}>
          Berbagi Kebaikan
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#666',
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: '1.5'
        }}>
          Buat kegiatan donasi, bagikan cerita, dan kumpulkan dukungan
        </p>
      </div>

      {/* Events Feed - Like Social Media */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
            border: '1px solid #eee',
            borderRadius: '12px',
          }}>
            <p style={{ marginBottom: '16px' }}>Belum ada kegiatan donasi</p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: 'none',
                  border: '1px solid #e0e0e0',
                  padding: '8px 20px',
                  borderRadius: '24px',
                  fontSize: '13px',
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
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: '32px',
                  borderBottom: '1px solid #f0f0f0',
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
                      src={event.organizerPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizerName)}&background=f5f5f5&color=666`}
                      alt={event.organizerName}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>
                          {event.organizerName}
                        </span>
                        <VerifiedBadge size={14} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                        {formatTime(event.createdAt)} • {event.location}
                      </div>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                    <MoreIcon size={18} />
                  </button>
                </div>
                
                {/* Image */}
                {event.imageUrl && (
                  <div style={{
                    marginBottom: '16px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                  }}>
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </div>
                )}
                
                {/* Title & Description */}
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  letterSpacing: '-0.2px',
                }}>
                  {event.title}
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                }}>
                  {event.description}
                </p>
                
                {/* Progress */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    marginBottom: '8px',
                    color: '#666',
                  }}>
                    <span>Terkumpul</span>
                    <span>{formatRupiah(event.currentAmount)} / {formatRupiah(event.targetAmount)}</span>
                  </div>
                  <div style={{
                    height: '4px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: '#111',
                      borderRadius: '2px',
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#999',
                  }}>
                    <span>{percentage}% terkumpul</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CalendarIcon size={12} />
                      {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Selesai'}
                    </span>
                  </div>
                </div>
                
                {/* Animasi Donasi Baru */}
                {isAnimating && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      padding: '12px',
                      background: '#f8f8f8',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      color: '#666',
                    }}
                  >
                    + Donasi baru! Terima kasih atas dukungannya 🙏
                  </motion.div>
                )}
                
                {/* Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  padding: '12px 0',
                  borderTop: '1px solid #f0f0f0',
                  borderBottom: '1px solid #f0f0f0',
                }}>
                  <button
                    onClick={() => handleLike(event.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      color: isLiked ? '#e74c3c' : '#999',
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
                      color: '#999',
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
                      color: '#111',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    <SendIcon size={16} />
                    <span>Donasi</span>
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    color: '#999',
                    cursor: 'pointer',
                  }}>
                    <ShareIcon size={16} />
                  </button>
                </div>
                
                {/* Recent Donors */}
                {event.donors.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                      {event.donors.length} donatur
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}>
                      {event.donors.slice(0, 3).map((donor) => (
                        <div key={donor.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: '#666',
                          background: '#f8f8f8',
                          padding: '4px 10px',
                          borderRadius: '20px',
                        }}>
                          <span>{donor.name}</span>
                          <span>•</span>
                          <span>{formatRupiah(donor.amount)}</span>
                        </div>
                      ))}
                      {event.donors.length > 3 && (
                        <span style={{ fontSize: '12px', color: '#999' }}>
                          +{event.donors.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Comments Preview */}
                {event.comments.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    {event.comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} style={{
                        marginBottom: '8px',
                        fontSize: '13px',
                      }}>
                        <span style={{ fontWeight: '500' }}>{comment.name}</span>{' '}
                        <span style={{ color: '#666' }}>{comment.text}</span>
                        <span style={{ fontSize: '11px', color: '#999', marginLeft: '8px' }}>
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
                      value={selectedEvent?.id === event.id ? newComment : ''}
                      onChange={(e) => {
                        setSelectedEvent(event);
                        setNewComment(e.target.value);
                      }}
                      placeholder="Tulis komentar..."
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#f8f8f8',
                        border: '1px solid #eee',
                        borderRadius: '20px',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleComment(event.id)}
                      disabled={!newComment.trim()}
                      style={{
                        padding: '8px 16px',
                        background: 'none',
                        border: '1px solid #e0e0e0',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                        color: newComment.trim() ? '#111' : '#ccc',
                      }}
                    >
                      Kirim
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '500' }}>Buat Kegiatan Donasi</h2>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <CloseIcon size={20} />
                </button>
              </div>
              
              {/* Image Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>
                  Foto (opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImage(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '40px',
                    border: '1px dashed #e0e0e0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: '#fafafa',
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                  ) : (
                    <>
                      <ImageIcon size={20} />
                      <span style={{ fontSize: '13px', color: '#999' }}>Upload foto</span>
                    </>
                  )}
                </label>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Judul kegiatan"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Deskripsi kegiatan"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="number"
                  value={newEvent.targetAmount}
                  onChange={(e) => setNewEvent({ ...newEvent, targetAmount: e.target.value })}
                  placeholder="Target donasi (Rp)"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Lokasi"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              
              <button
                onClick={handleCreateEvent}
                disabled={isSubmitting || !newEvent.title || !newEvent.description}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#111',
                  border: 'none',
                  borderRadius: '24px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isSubmitting || !newEvent.title || !newEvent.description ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || !newEvent.title || !newEvent.description ? 0.5 : 1,
                }}
              >
                {isSubmitting ? 'Membuat...' : 'Buat Kegiatan'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donate Modal */}
      <AnimatePresence>
        {showDonateModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowDonateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '450px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '500' }}>Kirim Donasi</h2>
                <button onClick={() => setShowDonateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <CloseIcon size={18} />
                </button>
              </div>
              
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                {selectedEvent.title}
              </p>
              
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Jumlah donasi (min Rp 10.000)"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '20px',
                }}
              />
              
              <textarea
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                placeholder="Pesan dukungan..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '14px',
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
                  background: '#111',
                  border: 'none',
                  borderRadius: '24px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isSubmitting || !donationAmount || !donationMessage ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || !donationAmount || !donationMessage ? 0.5 : 1,
                }}
              >
                {isSubmitting ? 'Memproses...' : 'Kirim Donasi'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#111',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '40px',
              fontSize: '13px',
              zIndex: 1001,
            }}
          >
            Terima kasih atas donasinya! 🙏
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
