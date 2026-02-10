'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged,
  User
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
  updateDoc,
  deleteDoc
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

// Type untuk event kalender
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  color: string;
  label: string;
  createdBy: string;
  createdByEmail: string;
  isAdmin: boolean;
  createdAt: Timestamp | Date;
}

// Type untuk event form
interface EventFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  color: string;
  label: string;
}

export default function CalendarPage(): React.JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State untuk kalender
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  
  // State untuk form tambah event
  const [eventForm, setEventForm] = useState<EventFormData>({
    title: "",
    description: "",
    date: new Date(),
    time: "09:00",
    color: "#3B82F6",
    label: "Meeting"
  });
  
  // State untuk edit event
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // Ref
  const calendarModalRef = useRef<HTMLDivElement>(null);
  const addEventModalRef = useRef<HTMLDivElement>(null);
  const eventDetailsModalRef = useRef<HTMLDivElement>(null);
  
  // Warna dan label preset
  const colorOptions = [
    { value: "#3B82F6", label: "Blue", name: "Biru", icon: "🟦" },
    { value: "#EF4444", label: "Red", name: "Merah", icon: "🟥" },
    { value: "#10B981", label: "Green", name: "Hijau", icon: "🟩" },
    { value: "#F59E0B", label: "Yellow", name: "Kuning", icon: "🟨" },
    { value: "#8B5CF6", label: "Purple", name: "Ungu", icon: "🟪" },
    { value: "#EC4899", label: "Pink", name: "Pink", icon: "💗" },
    { value: "#6366F1", label: "Indigo", name: "Indigo", icon: "🔵" },
    { value: "#F97316", label: "Orange", name: "Oranye", icon: "🟧" }
  ];
  
  const labelOptions = [
    { value: "Meeting", label: "Meeting", icon: "📅" },
    { value: "Event", label: "Event", icon: "🎉" },
    { value: "Deadline", label: "Deadline", icon: "⏰" },
    { value: "Reminder", label: "Reminder", icon: "🔔" },
    { value: "Birthday", label: "Birthday", icon: "🎂" },
    { value: "Holiday", label: "Holiday", icon: "🏖️" },
    { value: "Appointment", label: "Appointment", icon: "👥" },
    { value: "Task", label: "Task", icon: "✅" },
    { value: "Update", label: "Update", icon: "🔄" },
    { value: "Maintenance", label: "Maintenance", icon: "🔧" },
    { value: "Development", label: "Development", icon: "💻" },
    { value: "Security", label: "Security", icon: "🔒" },
    { value: "Optimization", label: "Optimization", icon: "⚡" },
    { value: "Feature", label: "Feature", icon: "🌟" }
  ];
  
  // Fungsi untuk mendapatkan nama bulan
  const getMonthName = (monthIndex: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthIndex];
  };
  
  // Fungsi untuk mendapatkan jumlah hari dalam bulan
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Fungsi untuk mendapatkan hari pertama dalam bulan (0 = Minggu, 1 = Senin, dst)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };
  
  // Fungsi untuk generate kalender
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // Tambahkan hari kosong untuk hari-hari sebelum bulan dimulai
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Tambahkan hari-hari dalam bulan
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(currentYear, currentMonth, i);
      const dayEvents = calendarEvents.filter(event => {
        const eventDate = event.date instanceof Date ? event.date : event.date.toDate();
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
        isSelected: selectedDate ? currentDate.toDateString() === selectedDate.toDateString() : false,
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
  
  // Fungsi untuk format tanggal
  const formatDate = (date: Date): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };
  
  // Fungsi untuk format waktu
  const formatTime = (date: Date, timeString?: string): string => {
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    }
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
  };
  
  // Fungsi untuk mengecek apakah user adalah admin
  const checkIfAdmin = (email: string): boolean => {
    const adminEmails = ['faridardiansyah061@gmail.com', 'admin@menuru.com'];
    return adminEmails.includes(email.toLowerCase());
  };
  
  // Load user dan events dari Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserDisplayName(currentUser.displayName || currentUser.email?.split('@')[0] || 'User');
        setUserEmail(currentUser.email || '');
        setIsAdmin(checkIfAdmin(currentUser.email || ''));
      } else {
        setUser(null);
        setUserDisplayName('');
        setUserEmail('');
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribeAuth();
  }, []);
  
  // Load events dari Firebase
  useEffect(() => {
    if (!db) return;
    
    setIsLoadingEvents(true);
    
    const eventsRef = collection(db, 'calendarEvents');
    const q = query(eventsRef, orderBy('date', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const eventsData: CalendarEvent[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let eventDate = data.date;
          
          // Convert Firestore Timestamp to Date if needed
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
            time: data.time || "00:00",
            color: data.color || "#3B82F6",
            label: data.label || "Event",
            createdBy: data.createdBy || "Unknown",
            createdByEmail: data.createdByEmail || "",
            isAdmin: data.isAdmin || false,
            createdAt: data.createdAt || new Date()
          });
        });
        
        console.log(`✅ Loaded ${eventsData.length} calendar events`);
        setCalendarEvents(eventsData);
        setIsLoadingEvents(false);
      },
      (error) => {
        console.error("❌ Error loading calendar events:", error);
        setIsLoadingEvents(false);
      }
    );
    
    return () => unsubscribe();
  }, [db]);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addEventModalRef.current && !addEventModalRef.current.contains(event.target as Node)) {
        setShowAddEventModal(false);
        setIsEditingEvent(false);
        setEditingEventId(null);
      }
      if (eventDetailsModalRef.current && !eventDetailsModalRef.current.contains(event.target as Node)) {
        setShowEventDetailsModal(false);
        setSelectedEvent(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handler untuk form input
  const handleFormInputChange = (field: keyof EventFormData, value: string | Date) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handler untuk submit event baru
  const handleSubmitEvent = async () => {
    if (!user || !db) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    
    if (!eventForm.title.trim()) {
      alert("Judul kegiatan tidak boleh kosong!");
      return;
    }
    
    try {
      // Combine date and time
      const [hours, minutes] = eventForm.time.split(':');
      const eventDate = new Date(eventForm.date);
      eventDate.setHours(parseInt(hours), parseInt(minutes));
      
      const eventData = {
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        date: eventDate,
        time: eventForm.time,
        color: eventForm.color,
        label: eventForm.label,
        createdBy: userDisplayName,
        createdByEmail: userEmail,
        isAdmin: isAdmin,
        createdAt: serverTimestamp()
      };
      
      if (isEditingEvent && editingEventId) {
        // Update existing event
        const eventRef = doc(db, 'calendarEvents', editingEventId);
        await updateDoc(eventRef, eventData);
        console.log("✅ Event updated:", editingEventId);
      } else {
        // Add new event
        const docRef = await addDoc(collection(db, 'calendarEvents'), eventData);
        console.log("✅ Event added with ID:", docRef.id);
      }
      
      // Reset form
      setEventForm({
        title: "",
        description: "",
        date: selectedDate || new Date(),
        time: "09:00",
        color: "#3B82F6",
        label: "Meeting"
      });
      
      setIsEditingEvent(false);
      setEditingEventId(null);
      setShowAddEventModal(false);
      
      alert(isEditingEvent ? "Kegiatan berhasil diperbarui!" : "Kegiatan berhasil ditambahkan!");
      
    } catch (error) {
      console.error("❌ Error saving event:", error);
      alert("Gagal menyimpan kegiatan. Silakan coba lagi.");
    }
  };
  
  // Handler untuk edit event
  const handleEditEvent = (event: CalendarEvent) => {
    const eventDate = event.date instanceof Date ? eventDate : event.date.toDate();
    
    setEventForm({
      title: event.title,
      description: event.description,
      date: eventDate,
      time: event.time || "09:00",
      color: event.color,
      label: event.label
    });
    
    setIsEditingEvent(true);
    setEditingEventId(event.id);
    setShowAddEventModal(true);
    setShowEventDetailsModal(false);
  };
  
  // Handler untuk hapus event
  const handleDeleteEvent = async (eventId: string) => {
    if (!db) return;
    
    if (!confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'calendarEvents', eventId));
      console.log("✅ Event deleted:", eventId);
      setShowEventDetailsModal(false);
      setSelectedEvent(null);
      alert("Kegiatan berhasil dihapus!");
    } catch (error) {
      console.error("❌ Error deleting event:", error);
      alert("Gagal menghapus kegiatan. Silakan coba lagi.");
    }
  };
  
  // Handler untuk melihat detail event
  const handleViewEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };
  
  // Handler untuk today button
  const handleTodayClick = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  };
  
  // Effect untuk resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddEventModal) {
          setShowAddEventModal(false);
          setIsEditingEvent(false);
          setEditingEventId(null);
        }
        if (showEventDetailsModal) {
          setShowEventDetailsModal(false);
          setSelectedEvent(null);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddEventModal, showEventDetailsModal]);
  
  // Animasi untuk modal
  useEffect(() => {
    if (showAddEventModal || showEventDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddEventModal, showEventDetailsModal]);

  // SVG Icons
  const ArrowSouthWest = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const ArrowNorthEast = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );

  const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  const TagIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );

  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );

  const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );

  const LoadingSpinner = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      overflow: 'auto',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      
      {/* Header dengan Back Button dan User Info */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1rem' : '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Back Button dengan Arrow South West */}
        <motion.button
          onClick={() => router.push('/')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            padding: '0.8rem 1.2rem',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '400',
            transition: 'all 0.3s ease'
          }}
          whileHover={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            transform: 'translateX(-2px)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div style={{ transform: 'rotate(225deg)' }}>
            <ArrowNorthEast />
          </div>
          Halaman utama
        </motion.button>
        
        {/* Judul Kalender */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon />
          </div>
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '300',
            margin: 0,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Kalender MENURU
          </h1>
        </div>
        
        {/* User Info dengan Arrow North East */}
        {user && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              cursor: 'default'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <UserIcon />
              <span style={{
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '400'
              }}>
                {userDisplayName}
              </span>
            </div>
            <div style={{
              color: isAdmin ? '#3B82F6' : '#10B981',
              fontSize: '0.8rem',
              fontWeight: '600',
              padding: '0.2rem 0.6rem',
              borderRadius: '8px',
              backgroundColor: isAdmin ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${isAdmin ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}>
              {isAdmin ? 'Admin' : 'User'}
            </div>
            <div style={{ transform: 'rotate(45deg)', opacity: 0.7 }}>
              <ArrowNorthEast />
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Main Calendar Content */}
      <div style={{
        width: '100%',
        maxWidth: '1400px',
        marginTop: isMobile ? '5rem' : '8rem',
        padding: isMobile ? '1rem' : '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        
        {/* Kontrol Tahun & Bulan */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Navigasi Bulan */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <motion.button
              onClick={() => navigateMonth('prev')}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateX(-2px)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </motion.button>
            
            <div style={{
              color: 'white',
              fontSize: isMobile ? '1.3rem' : '1.8rem',
              fontWeight: '300',
              minWidth: '200px',
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}>
              {getMonthName(currentMonth)} {currentYear}
            </div>
            
            <motion.button
              onClick={() => navigateMonth('next')}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateX(2px)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </motion.button>
          </div>
          
          {/* Pilih Tahun */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {[2023, 2024, 2025, 2026, 2027].map(year => (
              <motion.button
                key={year}
                onClick={() => setCurrentYear(year)}
                style={{
                  backgroundColor: currentYear === year ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: currentYear === year ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: currentYear === year ? '#3B82F6' : 'rgba(255, 255, 255, 0.8)',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: currentYear === year ? '500' : '400',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ 
                  backgroundColor: currentYear === year ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  transform: 'translateY(-1px)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {year}
              </motion.button>
            ))}
          </div>
          
          {/* Pilih Bulan */}
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap'
          }}>
            {[
              'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
              'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
            ].map((month, index) => (
              <motion.button
                key={month}
                onClick={() => setCurrentMonth(index)}
                style={{
                  backgroundColor: currentMonth === index ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: currentMonth === index ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: currentMonth === index ? '#3B82F6' : 'rgba(255, 255, 255, 0.8)',
                  padding: '0.4rem 0.7rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: currentMonth === index ? '500' : '400',
                  minWidth: '38px',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ 
                  backgroundColor: currentMonth === index ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  transform: 'translateY(-1px)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {month}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Grid Kalender */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Header Hari */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            padding: '0.5rem 0',
            marginBottom: '0.5rem'
          }}>
            {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
              <div key={day} style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: isMobile ? '0.75rem' : '0.85rem',
                fontWeight: '500',
                textAlign: 'center',
                padding: '0.8rem 0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid Tanggal */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem'
          }}>
            {generateCalendar().map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} style={{ 
                  height: isMobile ? '100px' : '140px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }} />;
              }
              
              const hasEvents = day.events && day.events.length > 0;
              
              return (
                <motion.div
                  key={`day-${day.date}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.005 }}
                  onClick={() => isAdmin && handleDateSelect(day.fullDate)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: day.isToday ? '2px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '1rem',
                    minHeight: isMobile ? '100px' : '140px',
                    cursor: isAdmin ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                  whileHover={isAdmin ? { 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)'
                  } : {}}
                >
                  {/* Tanggal */}
                  <div style={{
                    color: day.isToday ? '#3B82F6' : (day.isSelected ? 'white' : 'rgba(255, 255, 255, 0.9)'),
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: day.isToday ? '700' : '600',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{day.date}</span>
                    {day.isToday && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#3B82F6',
                          borderRadius: '50%',
                          boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)'
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Event Indicators */}
                  {hasEvents && (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      overflowY: 'auto'
                    }}>
                      {day.events.slice(0, 3).map(event => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEventDetails(event);
                          }}
                          style={{
                            backgroundColor: `${event.color}15`,
                            borderLeft: `3px solid ${event.color}`,
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          whileHover={{ 
                            backgroundColor: `${event.color}25`,
                            transform: 'translateX(2px)'
                          }}
                        >
                          <div style={{
                            color: 'white',
                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              backgroundColor: event.color,
                              borderRadius: '50%',
                              flexShrink: 0
                            }} />
                            {event.title}
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: isMobile ? '0.55rem' : '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            marginTop: '0.1rem'
                          }}>
                            <TagIcon />
                            {event.label}
                          </div>
                        </motion.div>
                      ))}
                      {day.events.length > 3 && (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: isMobile ? '0.55rem' : '0.65rem',
                          textAlign: 'center',
                          padding: '0.2rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px'
                        }}>
                          +{day.events.length - 3} lainnya
                          <div style={{ transform: 'rotate(45deg)', display: 'inline-block', marginLeft: '0.3rem' }}>
                            <ArrowNorthEast />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Add Event Button for Admin */}
                  {isAdmin && !hasEvents && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                      onClick={() => handleDateSelect(day.fullDate)}
                      style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        width: '24px',
                        height: '24px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#3B82F6',
                        transition: 'all 0.3s ease'
                      }}
                      whileHover={{ 
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        transform: 'scale(1.1)'
                      }}
                    >
                      +
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Legend for Event Colors */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '400',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            Legenda Warna Kegiatan
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {colorOptions.map(color => (
              <motion.div
                key={color.value}
                whileHover={{ scale: 1.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.8rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: 'default'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: color.value,
                  borderRadius: '4px',
                  boxShadow: `0 2px 4px ${color.value}40`
                }} />
                <span style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.85rem'
                }}>
                  {color.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Instructions for Admin */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              marginTop: '1rem'
            }}
          >
            <h3 style={{
              color: '#3B82F6',
              fontSize: '1.1rem',
              fontWeight: '400',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <InfoIcon />
              Panduan Admin
            </h3>
            <ul style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              margin: 0,
              paddingLeft: '1.5rem',
              lineHeight: 1.6
            }}>
              <li>Klik pada tanggal untuk menambahkan kegiatan baru</li>
              <li>Klik pada kegiatan untuk melihat detail atau mengedit</li>
              <li>Hanya admin yang dapat menambah, edit, dan hapus kegiatan</li>
              <li>Data tersinkronisasi dengan halaman utama</li>
            </ul>
          </motion.div>
        )}
      </div>
      
      {/* Modal Add/Edit Event */}
      <AnimatePresence>
        {showAddEventModal && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              zIndex: 10002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(20px)',
              overflow: 'auto',
              padding: isMobile ? '1rem' : '2rem'
            }}
          >
            <motion.div
              ref={addEventModalRef}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, type: "spring", damping: 25 }}
              style={{
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Header Modal */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CalendarIcon />
                  </div>
                  <div>
                    <h2 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.3rem' : '1.8rem',
                      fontWeight: '300',
                      margin: 0,
                      letterSpacing: '-0.5px'
                    }}>
                      {isEditingEvent ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
                    </h2>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      marginTop: '0.3rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <ClockIcon />
                      {formatDate(eventForm.date)}
                    </div>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setIsEditingEvent(false);
                    setEditingEventId(null);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'rotate(90deg)'
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <CloseIcon />
                </motion.button>
              </div>
              
              {/* Form Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1.5rem' : '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {/* Title Input */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Judul Kegiatan *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => handleFormInputChange('title', e.target.value)}
                    placeholder="Masukkan judul kegiatan"
                    style={{
                      width: '100%',
                      padding: '1rem 1.2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
                
                {/* Description Input */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '500'
                  }}>
                    Deskripsi
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => handleFormInputChange('description', e.target.value)}
                    placeholder="Masukkan deskripsi kegiatan"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '1rem 1.2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      resize: 'vertical',
                      minHeight: '100px',
                      fontFamily: '"Inter", sans-serif'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
                
                {/* Date and Time */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontWeight: '500'
                    }}>
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={eventForm.date.toISOString().split('T')[0]}
                      onChange={(e) => handleFormInputChange('date', new Date(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '1rem 1.2rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontWeight: '500'
                    }}>
                      Waktu
                    </label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => handleFormInputChange('time', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem 1.2rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      }}
                    />
                  </div>
                </div>
                
                {/* Color Selection */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    marginBottom: '0.8rem',
                    display: 'block',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: eventForm.color,
                      borderRadius: '4px'
                    }} />
                    Warna Label
                  </label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {colorOptions.map(color => (
                      <motion.button
                        key={color.value}
                        type="button"
                        onClick={() => handleFormInputChange('color', color.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: color.value,
                          border: eventForm.color === color.value ? '3px solid white' : '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          color: 'white',
                          boxShadow: eventForm.color === color.value ? `0 0 0 2px ${color.value}40` : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {eventForm.color === color.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            ✓
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Label Selection */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    marginBottom: '0.8rem',
                    display: 'block',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <TagIcon />
                    Jenis Label
                  </label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {labelOptions.map(label => (
                      <motion.button
                        key={label.value}
                        type="button"
                        onClick={() => handleFormInputChange('label', label.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '0.6rem 1rem',
                          backgroundColor: eventForm.label === label.value ? `${eventForm.color}20` : 'rgba(255, 255, 255, 0.05)',
                          border: eventForm.label === label.value ? `1px solid ${eventForm.color}` : '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: eventForm.label === label.value ? eventForm.color : 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {label.icon} {label.label}
                        {eventForm.label === label.value && (
                          <div style={{ transform: 'rotate(45deg)' }}>
                            <ArrowNorthEast />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* User Info */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#3B82F6'
                      }}>
                        <UserIcon />
                      </div>
                      <div>
                        <div style={{
                          color: 'white',
                          fontSize: '0.95rem',
                          fontWeight: '600'
                        }}>
                          {userDisplayName}
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.85rem'
                        }}>
                          {userEmail}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      color: isAdmin ? '#3B82F6' : '#10B981',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '8px',
                      backgroundColor: isAdmin ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      border: `1px solid ${isAdmin ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {isAdmin ? 'Admin' : 'User'}
                      <div style={{ transform: 'rotate(45deg)' }}>
                        <ArrowNorthEast />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Footer Modal */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                flexShrink: 0
              }}>
                <motion.button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setIsEditingEvent(false);
                    setEditingEventId(null);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '0.9rem 1.8rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Batal
                </motion.button>
                
                <motion.button
                  onClick={handleSubmitEvent}
                  disabled={!eventForm.title.trim()}
                  whileHover={eventForm.title.trim() ? { scale: 1.02 } : {}}
                  whileTap={eventForm.title.trim() ? { scale: 0.98 } : {}}
                  style={{
                    padding: '0.9rem 1.8rem',
                    backgroundColor: eventForm.title.trim() ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: eventForm.title.trim() ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: eventForm.title.trim() ? '#3B82F6' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: eventForm.title.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isEditingEvent ? 'Update Kegiatan' : 'Simpan Kegiatan'}
                  <div style={{ transform: 'rotate(45deg)' }}>
                    <ArrowNorthEast />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal Event Details */}
      <AnimatePresence>
        {showEventDetailsModal && selectedEvent && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              zIndex: 10002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(20px)',
              overflow: 'auto',
              padding: isMobile ? '1rem' : '2rem'
            }}
          >
            <motion.div
              ref={eventDetailsModalRef}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, type: "spring", damping: 25 }}
              style={{
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: `1px solid ${selectedEvent.color}30`,
                boxShadow: `0 20px 60px ${selectedEvent.color}10`
              }}
            >
              {/* Header Modal */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                  <div style={{
                    width: '4px',
                    height: '100%',
                    backgroundColor: selectedEvent.color,
                    borderRadius: '2px',
                    flexShrink: 0
                  }} />
                  
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.5rem' : '2.2rem',
                      fontWeight: '300',
                      margin: '0 0 0.8rem 0',
                      letterSpacing: '-0.5px',
                      lineHeight: 1.2
                    }}>
                      {selectedEvent.title}
                    </h2>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                          backgroundColor: `${selectedEvent.color}20`,
                          color: selectedEvent.color,
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          padding: '0.3rem 0.9rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          border: `1px solid ${selectedEvent.color}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: selectedEvent.color,
                          borderRadius: '50%'
                        }} />
                        {selectedEvent.label}
                      </motion.div>
                      
                      {selectedEvent.isAdmin && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3B82F6',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '0.3rem 0.9rem',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          ADMIN
                          <div style={{ transform: 'rotate(45deg)' }}>
                            <ArrowNorthEast />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => {
                    setShowEventDetailsModal(false);
                    setSelectedEvent(null);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'rotate(90deg)'
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <CloseIcon />
                </motion.button>
              </div>
              
              {/* Event Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1.5rem' : '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {/* Date and Time */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: `${selectedEvent.color}15`,
                    border: `1px solid ${selectedEvent.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ClockIcon />
                  </div>
                  <div>
                    <div style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '500',
                      marginBottom: '0.3rem'
                    }}>
                      {formatDate(selectedEvent.date instanceof Date ? selectedEvent.date : selectedEvent.date.toDate())}
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ transform: 'rotate(45deg)' }}>
                        <ArrowNorthEast />
                      </div>
                      {formatTime(selectedEvent.date instanceof Date ? selectedEvent.date : selectedEvent.date.toDate(), selectedEvent.time)} WIB
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      margin: '0 0 1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      Deskripsi
                    </h3>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
                
                {/* Created By */}
                <div style={{
                  padding: '1.2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    marginBottom: '0.8rem'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#3B82F6',
                      flexShrink: 0
                    }}>
                      <UserIcon />
                    </div>
                    <div>
                      <div style={{
                        color: 'white',
                        fontSize: '1.05rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {selectedEvent.createdBy}
                        {selectedEvent.isAdmin && (
                          <span style={{
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            color: '#3B82F6',
                            padding: '0.1rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            ADMIN
                            <div style={{ transform: 'rotate(45deg)' }}>
                              <ArrowNorthEast />
                            </div>
                          </span>
                        )}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        marginTop: '0.2rem'
                      }}>
                        {selectedEvent.createdByEmail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Modal with Actions */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexShrink: 0
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  Dibuat pada {selectedEvent.createdAt instanceof Date ? 
                    selectedEvent.createdAt.toLocaleDateString('id-ID') : 
                    selectedEvent.createdAt.toDate().toLocaleDateString('id-ID')}
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '0.8rem'
                }}>
                  {isAdmin && (
                    <>
                      <motion.button
                        onClick={() => handleEditEvent(selectedEvent)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '0.8rem 1.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <EditIcon />
                        Edit
                        <div style={{ transform: 'rotate(45deg)' }}>
                          <ArrowNorthEast />
                        </div>
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '0.8rem 1.5rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '10px',
                          color: '#EF4444',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <DeleteIcon />
                        Hapus
                        <div style={{ transform: 'rotate(45deg)' }}>
                          <ArrowNorthEast />
                        </div>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
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
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              cursor: 'default'
            }}
          >
            <div style={{
              color: 'white',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <LoadingSpinner />
              </motion.div>
              <div>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: '300',
                  letterSpacing: '1px',
                  marginBottom: '0.5rem'
                }}>
                  Loading Calendar...
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.9rem',
                  fontWeight: '300'
                }}>
                  MENURU Calendar System
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
