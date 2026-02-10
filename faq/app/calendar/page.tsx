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
  getDoc,
  updateDoc,
  deleteDoc,
  where,
  getDocs
} from "firebase/firestore";

// Konfigurasi Firebase (sama dengan halaman utama)
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
    { value: "#3B82F6", label: "Blue", name: "Biru" },
    { value: "#EF4444", label: "Red", name: "Merah" },
    { value: "#10B981", label: "Green", name: "Hijau" },
    { value: "#F59E0B", label: "Yellow", name: "Kuning" },
    { value: "#8B5CF6", label: "Purple", name: "Ungu" },
    { value: "#EC4899", label: "Pink", name: "Pink" },
    { value: "#6366F1", label: "Indigo", name: "Indigo" },
    { value: "#F97316", label: "Orange", name: "Oranye" }
  ];
  
  const labelOptions = [
    { value: "Meeting", label: "Meeting" },
    { value: "Event", label: "Event" },
    { value: "Deadline", label: "Deadline" },
    { value: "Reminder", label: "Reminder" },
    { value: "Birthday", label: "Birthday" },
    { value: "Holiday", label: "Holiday" },
    { value: "Appointment", label: "Appointment" },
    { value: "Task", label: "Task" },
    { value: "Update", label: "Update" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Development", label: "Development" },
    { value: "Security", label: "Security" },
    { value: "Optimization", label: "Optimization" },
    { value: "Feature", label: "Feature" }
  ];
  
  // Fungsi untuk mendapatkan nama bulan
  const getMonthName = (monthIndex: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthIndex];
  };
  
  // Fungsi untuk mendapatkan nama bulan singkat
  const getShortMonthName = (monthIndex: number): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return months[monthIndex];
  };
  
  // Fungsi untuk mendapatkan hari dalam seminggu
  const getDayName = (dayIndex: number): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex];
  };
  
  // Fungsi untuk mendapatkan hari dalam seminggu singkat
  const getShortDayName = (dayIndex: number): string => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[dayIndex];
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
  
  // Fungsi untuk pilih tahun
  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
  };
  
  // Fungsi untuk pilih bulan
  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
  };
  
  // Fungsi untuk pilih tanggal
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setEventForm(prev => ({
      ...prev,
      date: date
    }));
    setShowAddEventModal(true);
  };
  
  // Fungsi untuk format tanggal
  const formatDate = (date: Date): string => {
    return `${getDayName(date.getDay())}, ${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}`;
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
  
  // Fungsi untuk menghitung total event dalam tahun ini
  const getTotalEventsThisYear = () => {
    const eventsThisYear = calendarEvents.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : event.date.toDate();
      return eventDate.getFullYear() === currentYear;
    });
    return eventsThisYear.length;
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
    const eventDate = event.date instanceof Date ? event.date : event.date.toDate();
    
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
  
  // Hitung total event
  const totalEventsThisYear = getTotalEventsThisYear();
  
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
      
      {/* Header dengan Back Button */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.2rem 1rem' : '1.8rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'black',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Back Button kiri - DIPERBAIKI */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          minWidth: 0
        }}>
          <motion.button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontFamily: 'Helvetica, Arial, sans-serif',
              padding: '0.5rem',
              gap: '0.5rem',
              fontWeight: '400',
              whiteSpace: 'nowrap'
            }}
            whileHover={{ opacity: 0.7 }}
          >
            {/* Tanda panah NORTH WEST ARROW di Back Button */}
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <path d="M7 17L17 7"/>
              <path d="M7 7H17V17"/>
            </svg>
            <span style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: '400',
              color: 'white',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Halaman utama
            </span>
          </motion.button>
        </div>
        
        {/* Judul kalender di tengah - DIPERBAIKI */}
        <div style={{
          flex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.2rem',
          minWidth: 0,
          padding: '0 1rem'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '400',
            margin: 0,
            fontFamily: 'Helvetica, Arial, sans-serif',
            letterSpacing: '0.5px',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Kalender MENURU
          </h1>
          
          {/* Tahun + Total Event sejajar dengan judul */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginTop: '0.3rem'
          }}>
            {/* Tahun */}
            <div style={{
              color: 'white',
              fontSize: isMobile ? '1rem' : '1.2rem',
              fontWeight: '400',
              fontFamily: 'Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{currentYear}</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '400',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  {totalEventsThisYear}
                </span>
                <span style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '400',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  Event
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nama user di bagian kanan dengan panah NORTH WEST ARROW BESAR - DIPERBAIKI */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          minWidth: 0
        }}>
          {user && (
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: 'transparent'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => router.push('/')}
            >
              {/* Tanda panah NORTH WEST ARROW BESAR di samping kiri nama user */}
              <svg 
                width={isMobile ? "22" : "30"} 
                height={isMobile ? "22" : "30"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                style={{ flexShrink: 0 }}
              >
                <path d="M7 17L17 7"/>
                <path d="M7 7H17V17"/>
              </svg>
              
              {/* Nama user BESAR */}
              <span style={{
                fontSize: isMobile ? '1.2rem' : '1.8rem',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.95)',
                fontFamily: 'Helvetica, Arial, sans-serif',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? '120px' : '200px'
              }}>
                {userDisplayName}
              </span>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Main Calendar Content */}
      <div style={{
        width: '100%',
        maxWidth: '1400px',
        marginTop: isMobile ? '8rem' : '10rem',
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
          padding: '1.2rem',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '15px'
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
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </motion.button>
            
            <div style={{
              color: 'white',
              fontSize: isMobile ? '1.5rem' : '1.8rem',
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
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
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
            {[2023, 2024, 2025, 2026, 2027, 2028].map(year => (
              <motion.button
                key={year}
                onClick={() => handleYearSelect(year)}
                style={{
                  backgroundColor: currentYear === year ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  whiteSpace: 'nowrap',
                  fontWeight: currentYear === year ? '500' : '400'
                }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                {year}
              </motion.button>
            ))}
          </div>
          
          {/* Pilih Bulan */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
              'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
            ].map((month, index) => (
              <motion.button
                key={month}
                onClick={() => handleMonthSelect(index)}
                style={{
                  backgroundColor: currentMonth === index ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  minWidth: '40px',
                  fontWeight: currentMonth === index ? '500' : '400'
                }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
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
            padding: '0.5rem 0'
          }}>
            {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
              <div key={day} style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: isMobile ? '0.9rem' : '1rem',
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
          
          {/* Grid Tanggal */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem'
          }}>
            {generateCalendar().map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} style={{ height: isMobile ? '90px' : '130px' }} />;
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
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '0.8rem',
                    minHeight: isMobile ? '90px' : '130px',
                    cursor: isAdmin ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={isAdmin ? { 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  } : {}}
                >
                  {/* Tanggal */}
                  <div style={{
                    color: day.isToday ? '#3B82F6' : (day.isSelected ? 'white' : 'rgba(255, 255, 255, 0.8)'),
                    fontSize: isMobile ? '1rem' : '1.1rem',
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
                  
                  {/* Event Indicators */}
                  {hasEvents && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      maxHeight: isMobile ? '55px' : '90px',
                      overflowY: 'auto'
                    }}>
                      {day.events.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEventDetails(event);
                          }}
                          style={{
                            backgroundColor: event.color + '20',
                            borderLeft: `3px solid ${event.color}`,
                            padding: '0.2rem 0.4rem',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            color: 'white',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {event.title}
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: isMobile ? '0.6rem' : '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}>
                            <span style={{
                              backgroundColor: event.color,
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%'
                            }} />
                            {event.label}
                          </div>
                        </div>
                      ))}
                      {day.events.length > 3 && (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: isMobile ? '0.6rem' : '0.7rem',
                          textAlign: 'center',
                          padding: '0.1rem'
                        }}>
                          +{day.events.length - 3} lainnya
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Add Event Button for Admin */}
                  {isAdmin && !hasEvents && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      whileHover={{ opacity: 1 }}
                      onClick={() => handleDateSelect(day.fullDate)}
                      style={{
                        position: 'absolute',
                        bottom: '0.3rem',
                        right: '0.3rem',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: 'white'
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
        
        {/* Instructions for Admin */}
        {isAdmin && (
          <div style={{
            padding: '1.2rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '15px',
            marginTop: '1rem'
          }}>
            <h3 style={{
              color: '#3B82F6',
              fontSize: '1.2rem',
              fontWeight: '500',
              margin: '0 0 0.8rem 0',
              fontFamily: 'Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
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
          </div>
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
              backgroundColor: 'rgba(0, 0, 0, 0.98)',
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
              ref={addEventModalRef}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: 'transparent',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Header Modal */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{
                    color: 'white',
                    fontSize: isMobile ? '1.5rem' : '1.8rem',
                    fontWeight: '400',
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '0.5px'
                  }}>
                    {isEditingEvent ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
                  </h2>
                  <div style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontSize: '0.9rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: '400'
                  }}>
                    {formatDate(eventForm.date)}
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
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
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
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  ×
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
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: '400'
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
                      padding: '0.8rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>
                
                {/* Description Input */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: '400'
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
                      padding: '0.8rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      resize: 'vertical',
                      minHeight: '100px'
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
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      fontWeight: '400'
                    }}>
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={eventForm.date.toISOString().split('T')[0]}
                      onChange={(e) => handleFormInputChange('date', new Date(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      fontWeight: '400'
                    }}>
                      Waktu
                    </label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => handleFormInputChange('time', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                
                {/* Color Selection */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: '400'
                  }}>
                    Warna
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
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: color.value,
                          border: eventForm.color === color.value ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          color: 'white',
                          fontWeight: '400'
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {eventForm.color === color.value && '✓'}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Label Selection */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: '400'
                  }}>
                    Label
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
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: eventForm.label === label.value ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '20px',
                          color: 'white',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          whiteSpace: 'nowrap',
                          fontWeight: eventForm.label === label.value ? '500' : '400'
                        }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        {label.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* User Info */}
                {user && (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: 'white'
                      }}>
                        {userDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          {userDisplayName}
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.8rem'
                        }}>
                          {isAdmin ? 'Admin' : 'User'} • {userEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer Modal */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
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
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  Batal
                </motion.button>
                
                <motion.button
                  onClick={handleSubmitEvent}
                  disabled={!eventForm.title.trim()}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: eventForm.title.trim() ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                    border: eventForm.title.trim() ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: eventForm.title.trim() ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.9rem',
                    fontWeight: '400',
                    cursor: eventForm.title.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={eventForm.title.trim() ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : {}}
                >
                  {isEditingEvent ? 'Update Kegiatan' : 'Simpan Kegiatan'}
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
              backgroundColor: 'rgba(0, 0, 0, 0.98)',
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
              ref={eventDetailsModalRef}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: 'transparent',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: `1px solid ${selectedEvent.color}40`
              }}
            >
              {/* Header Modal */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '12px',
                    height: '100%',
                    backgroundColor: selectedEvent.color,
                    borderRadius: '2px',
                    flexShrink: 0
                  }} />
                  
                  <div>
                    <h2 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.5rem' : '1.8rem',
                      fontWeight: '400',
                      margin: '0 0 0.5rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      {selectedEvent.title}
                    </h2>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        backgroundColor: selectedEvent.color + '30',
                        color: selectedEvent.color,
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '0.2rem 0.8rem',
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: `1px solid ${selectedEvent.color}`
                      }}>
                        {selectedEvent.label}
                      </div>
                      
                      {selectedEvent.isAdmin && (
                        <div style={{
                          backgroundColor: 'transparent',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          padding: '0.2rem 0.8rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          ADMIN
                        </div>
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
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
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
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  ×
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
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <div style={{
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      marginBottom: '0.2rem'
                    }}>
                      {formatDate(selectedEvent.date instanceof Date ? selectedEvent.date : selectedEvent.date.toDate())}
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem'
                    }}>
                      {formatTime(selectedEvent.date instanceof Date ? selectedEvent.date : selectedEvent.date.toDate(), selectedEvent.time)} WIB
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '500',
                      margin: '0 0 1rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      Deskripsi
                    </h3>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
                
                {/* Created By */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: 'white'
                    }}>
                      {selectedEvent.createdBy.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}>
                        {selectedEvent.createdBy}
                        {selectedEvent.isAdmin && (
                          <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.7rem',
                            backgroundColor: 'transparent',
                            color: 'white',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
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
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                flexShrink: 0
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.8rem',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  ID: {selectedEvent.id.substring(0, 8)}...
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  {isAdmin && (
                    <>
                      <motion.button
                        onClick={() => handleEditEvent(selectedEvent)}
                        style={{
                          padding: '0.8rem 1.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        style={{
                          padding: '0.8rem 1.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '10px',
                          color: '#EF4444',
                          fontSize: '0.9rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Hapus
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
              backgroundColor: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              cursor: 'default'
            }}
          >
            <div style={{
              color: 'white',
              textAlign: 'center'
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ marginBottom: '1rem' }}
              >
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </motion.div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '400',
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '0.5px'
              }}>
                Loading Calendar...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
