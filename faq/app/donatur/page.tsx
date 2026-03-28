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
const InstagramVerifiedBadge = ({ size = 20 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        marginLeft: '6px',
        verticalAlign: 'middle',
        cursor: 'help'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
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
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          marginBottom: '8px',
          zIndex: 1000
        }}>
          Akun Resmi
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#1a1a1a transparent transparent transparent'
          }} />
        </div>
      )}
    </span>
  );
};

// Icons
const PlusIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const HeartIcon = ({ size = 24, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ff6b6b" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const SendIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CloseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const MoreIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
);

const CommentIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ShareIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const CalendarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const LocationIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ArrowIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="7" y1="7" x2="17" y2="17"/>
    <polyline points="17 7 17 17 7 17"/>
  </svg>
);

const NorthEastArrow = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk animasi
  const [animateDonation, setAnimateDonation] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Format Rupiah dengan titik
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number dengan titik untuk input
  const formatNumberWithDots = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse string dengan titik ke number
  const parseNumberFromDots = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
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
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatDate(date);
  };

  // Hitung persentase
  const getPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.floor((current / target) * 100), 100);
  };

  // Hitung sisa hari
  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
    if (isNaN(targetAmount) || targetAmount < 1) {
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

  // Handle Donation (Manual input dengan format titik)
  const handleDonate = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    
    if (!selectedEvent) return;
    
    const amount = parseNumberFromDots(donationAmount);
    if (isNaN(amount) || amount < 1) {
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
      
      setFirebaseAuth(auth);
      setFirebaseDb(db);
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
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{ color: '#fff', fontSize: '16px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#fff',
      position: 'relative',
      padding: isMobile ? '20px' : '40px',
      paddingTop: isMobile ? '100px' : '120px',
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
        backgroundColor: '#000',
        borderBottom: '1px solid #222',
        zIndex: 100,
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: '600',
          letterSpacing: '-0.5px',
          cursor: 'pointer',
          color: '#fff'
        }} onClick={() => router.push('/')}>
          Menuru
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'none',
                border: '1px solid #222',
                fontSize: '15px',
                color: '#fff',
                cursor: 'pointer',
                padding: '10px 20px',
                borderRadius: '30px',
              }}
            >
              <PlusIcon size={20} />
              <span>Buat Kegiatan</span>
            </button>
          )}
          
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 16px',
              borderRadius: '30px',
              border: '1px solid #222',
            }}>
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=111&color=fff`} 
                alt={user.displayName}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <InstagramVerifiedBadge size={18} />
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  color: '#888',
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
                padding: '10px 24px',
                background: 'none',
                border: '1px solid #222',
                borderRadius: '30px',
                fontSize: '14px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Login dengan Google
            </button>
          )}
          
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#888',
            fontSize: '14px',
          }}>
            <NorthEastArrow size={18} />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
      }}>
        <h1 style={{
          fontSize: isMobile ? '36px' : '48px',
          fontWeight: '600',
          letterSpacing: '-1px',
          marginBottom: '16px',
          color: '#fff'
        }}>
          Berbagi Kebaikan
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#888',
          maxWidth: '550px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Buat kegiatan donasi, bagikan cerita, dan kumpulkan dukungan
        </p>
      </div>

      {/* Events Feed */}
      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
      }}>
        {events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#666',
            border: '1px solid #222',
            borderRadius: '16px',
          }}>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>Belum ada kegiatan donasi</p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: 'none',
                  border: '1px solid #222',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  fontSize: '14px',
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
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: '48px',
                  borderBottom: '1px solid #222',
                  paddingBottom: '40px',
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img 
                      src={event.organizerPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizerName)}&background=111&color=fff`}
                      alt={event.organizerName}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600', fontSize: '15px', color: '#fff' }}>
                          {event.organizerName}
                        </span>
                        <InstagramVerifiedBadge size={18} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {formatTime(event.createdAt)} • {event.location}
                      </div>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                    <MoreIcon size={22} />
                  </button>
                </div>
                
                {/* Title */}
                <h2 style={{
                  fontSize: '26px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  letterSpacing: '-0.3px',
                  color: '#fff'
                }}>
                  {event.title}
                </h2>
                
                {/* Description */}
                <p style={{
                  fontSize: '15px',
                  color: '#aaa',
                  lineHeight: '1.6',
                  marginBottom: '24px',
                }}>
                  {event.description}
                </p>
                
                {/* Progress */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    marginBottom: '12px',
                    color: '#888',
                  }}>
                    <span>Terkumpul</span>
                    <span style={{ fontWeight: '500', color: '#fff' }}>{formatRupiah(event.currentAmount)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    marginBottom: '8px',
                    color: '#888',
                  }}>
                    <span>Target</span>
                    <span style={{ fontWeight: '500', color: '#fff' }}>{formatRupiah(event.targetAmount)}</span>
                  </div>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#222',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginTop: '12px',
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: '#fff',
                      borderRadius: '3px',
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    fontSize: '12px',
                    color: '#666',
                  }}>
                    <span>{percentage}% terkumpul</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarIcon size={14} />
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
                      padding: '14px',
                      background: '#111',
                      borderRadius: '10px',
                      marginBottom: '20px',
                      fontSize: '13px',
                      color: '#fff',
                      border: '1px solid #222',
                      textAlign: 'center',
                    }}
                  >
                    ✨ Donasi baru! Terima kasih atas dukungannya ✨
                  </motion.div>
                )}
                
                {/* Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '28px',
                  padding: '14px 0',
                  borderTop: '1px solid #222',
                  borderBottom: '1px solid #222',
                }}>
                  <button
                    onClick={() => handleLike(event.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      color: isLiked ? '#ff6b6b' : '#888',
                      cursor: 'pointer',
                    }}
                  >
                    <HeartIcon size={22} filled={isLiked} />
                    <span>{event.likes.length}</span>
                  </button>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      color: '#888',
                      cursor: 'pointer',
                    }}
                  >
                    <CommentIcon size={22} />
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
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      color: '#fff',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    <SendIcon size={20} />
                    <span>Donasi</span>
                    <NorthEastArrow size={16} />
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    color: '#888',
                    cursor: 'pointer',
                  }}>
                    <ShareIcon size={20} />
                  </button>
                </div>
                
                {/* Donors List */}
                {event.donors.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                      {event.donors.length} donatur
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}>
                      {event.donors.slice(0, 5).map((donor) => (
                        <div key={donor.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: '#aaa',
                          background: '#111',
                          padding: '6px 12px',
                          borderRadius: '30px',
                        }}>
                          <span>{donor.name}</span>
                          <span>•</span>
                          <span style={{ color: '#fff' }}>{formatRupiah(donor.amount)}</span>
                        </div>
                      ))}
                      {event.donors.length > 5 && (
                        <span style={{ fontSize: '12px', color: '#666', padding: '6px 0' }}>
                          +{event.donors.length - 5} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Comments */}
                {event.comments.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    {event.comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} style={{
                        marginBottom: '10px',
                        fontSize: '13px',
                        padding: '6px 0',
                      }}>
                        <span style={{ fontWeight: '600', color: '#fff', marginRight: '8px' }}>{comment.name}</span>
                        <span style={{ color: '#aaa' }}>{comment.text}</span>
                        <span style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>
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
                    gap: '10px',
                    marginTop: '14px',
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
                        padding: '10px 14px',
                        background: '#111',
                        border: '1px solid #222',
                        borderRadius: '30px',
                        fontSize: '13px',
                        color: '#fff',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleComment(event.id)}
                      disabled={!newComment.trim()}
                      style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: '1px solid #222',
                        borderRadius: '30px',
                        fontSize: '13px',
                        cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                        color: newComment.trim() ? '#fff' : '#444',
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
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                background: '#000',
                borderRadius: '24px',
                padding: '36px',
                maxWidth: '520px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid #222',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
              }}>
                <h2 style={{ fontSize: '26px', fontWeight: '600', color: '#fff' }}>Buat Kegiatan Donasi</h2>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                  <CloseIcon size={22} />
                </button>
              </div>
              
              <div style={{ marginBottom: '22px' }}>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Judul kegiatan"
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    border: 'none',
                    borderBottom: '1px solid #222',
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '22px' }}>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Deskripsi kegiatan"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    border: 'none',
                    borderBottom: '1px solid #222',
                    backgroundColor: 'transparent',
                    fontSize: '15px',
                    color: '#fff',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '22px' }}>
                <input
                  type="text"
                  value={newEvent.targetAmount}
                  onChange={(e) => setNewEvent({ ...newEvent, targetAmount: formatNumberWithDots(e.target.value) })}
                  placeholder="Target donasi (contoh: 1.000.000)"
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    border: 'none',
                    borderBottom: '1px solid #222',
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '22px' }}>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Lokasi"
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    border: 'none',
                    borderBottom: '1px solid #222',
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '28px' }}>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    border: 'none',
                    borderBottom: '1px solid #222',
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>
              
              <button
                onClick={handleCreateEvent}
                disabled={isSubmitting || !newEvent.title || !newEvent.description}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#fff',
                  border: 'none',
                  borderRadius: '40px',
                  color: '#000',
                  fontSize: '15px',
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
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowDonateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                background: '#000',
                borderRadius: '24px',
                padding: '36px',
                maxWidth: '480px',
                width: '100%',
                border: '1px solid #222',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#fff' }}>Kirim Donasi</h2>
                <button onClick={() => setShowDonateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                  <CloseIcon size={22} />
                </button>
              </div>
              
              <p style={{ fontSize: '15px', color: '#888', marginBottom: '28px' }}>
                {selectedEvent.title}
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>
                  Jumlah Donasi
                </label>
                <input
                  type="text"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(formatNumberWithDots(e.target.value))}
                  placeholder="Contoh: 50.000"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block' }}>
                  Pesan Dukungan
                </label>
                <textarea
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  placeholder="Tulis pesan dukungan Anda..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#fff',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
              
              <button
                onClick={handleDonate}
                disabled={isSubmitting || !donationAmount || !donationMessage}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#fff',
                  border: 'none',
                  borderRadius: '40px',
                  color: '#000',
                  fontSize: '15px',
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
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              color: '#000',
              padding: '14px 28px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: '500',
              zIndex: 1001,
            }}
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
