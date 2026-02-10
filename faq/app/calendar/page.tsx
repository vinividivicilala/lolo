'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
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
        {/* Back Button kiri */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center'
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
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              padding: '0.5rem',
              gap: '0.5rem',
              fontWeight: '400'
            }}
            whileHover={{ opacity: 0.7 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7"/>
              <path d="M7 7H17V17"/>
            </svg>
            <span style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: '400',
              color: 'white'
            }}>
              Halaman utama
            </span>
          </motion.button>
        </div>
        
        {/* Judul kalender di tengah NORMAL */}
        <div style={{
          flex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.2rem'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '600',
            margin: 0,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            letterSpacing: '0.5px',
            lineHeight: 1.2
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
              fontWeight: '500',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
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
                  fontWeight: '600',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                }}>
                  {totalEventsThisYear}
                </span>
                <span style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '400',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                }}>
                  Event
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nama user di bagian tengah kanan dengan panah NORTH WEST ARROW BESAR di kiri */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              {/* Tanda panah NORTH WEST ARROW BESAR di samping kiri nama user */}
              <svg 
                width={isMobile ? "24" : "28"} 
                height={isMobile ? "24" : "28"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.5"
                style={{ display: 'block' }}
              >
                <path d="M7 17L17 7" stroke="white" strokeWidth="2.5"/>
                <path d="M7 7H17V17" stroke="white" strokeWidth="2.5"/>
              </svg>
              
              {/* Nama user BESAR */}
              <span style={{
                fontSize: isMobile ? '1.4rem' : '1.8rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.95)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? '140px' : '200px'
              }}>
                {userDisplayName}
              </span>
            </div>
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
              fontWeight: '600',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
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
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                  whiteSpace: 'nowrap',
                  fontWeight: currentYear === year ? '600' : '400'
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
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                  minWidth: '40px',
                  fontWeight: currentMonth === index ? '600' : '400'
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
          {/* Header Hari - TEXS BESAR */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            padding: '0.5rem 0',
            marginBottom: '1rem'
          }}>
            {['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'].map(day => (
              <div key={day} style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '600',
                textAlign: 'center',
                padding: '0.8rem 0.5rem',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid Tanggal - TEXS BESAR dan JELAS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem'
          }}>
            {generateCalendar().map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} style={{ 
                  height: isMobile ? '120px' : '160px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px'
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
                    backgroundColor: day.isToday ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: day.isToday ? '2px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '0.8rem',
                    minHeight: isMobile ? '120px' : '160px',
                    cursor: isAdmin ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  whileHover={isAdmin ? { 
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  } : {}}
                >
                  {/* Tanggal - TEXS BESAR */}
                  <div style={{
                    color: day.isToday ? '#3B82F6' : (day.isSelected ? 'white' : 'rgba(255, 255, 255, 0.95)'),
                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                    fontWeight: '600',
                    marginBottom: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                  }}>
                    <span>{day.date}</span>
                    {day.isToday && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3B82F6',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                  
                  {/* Event Indicators dengan highlight warna di belakang teks */}
                  {hasEvents && (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      maxHeight: isMobile ? '70px' : '110px',
                      overflowY: 'auto'
                    }}>
                      {day.events.slice(0, 3).map(event => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEventDetails(event);
                          }}
                          style={{
                            backgroundColor: `${event.color}20`,
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          whileHover={{ backgroundColor: `${event.color}30` }}
                        >
                          {/* Highlight background */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: event.color,
                            opacity: 0.1,
                            zIndex: 1
                          }} />
                          
                          {/* Event content */}
                          <div style={{
                            position: 'relative',
                            zIndex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem'
                          }}>
                            <div style={{
                              color: 'white',
                              fontSize: isMobile ? '0.8rem' : '0.9rem',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                            }}>
                              {event.title}
                            </div>
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={event.color} strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                              {event.label}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {day.events.length > 3 && (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          textAlign: 'center',
                          padding: '0.2rem',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px'
                        }}>
                          +{day.events.length - 3} lainnya
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Add Event Button for Admin dengan icon SVG */}
                  {isAdmin && !hasEvents && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1, scale: 1.1 }}
                      onClick={() => handleDateSelect(day.fullDate)}
                      style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
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
            padding: '1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '15px',
            marginTop: '1rem'
          }}>
            <h3 style={{
              color: '#3B82F6',
              fontSize: '1.3rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              Panduan Admin
            </h3>
            <ul style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              margin: 0,
              paddingLeft: '1.8rem',
              lineHeight: 1.8,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
            }}>
              <li>Klik pada tanggal untuk menambahkan kegiatan baru</li>
              <li>Klik pada kegiatan untuk melihat detail atau mengedit</li>
              <li>Hanya admin yang dapat menambah, edit, dan hapus kegiatan</li>
              <li>Data tersinkronisasi dengan halaman utama</li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Modal Add/Edit Event - DESIGN LEBIH BAGUS */}
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
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
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
                flexShrink: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: eventForm.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={eventForm.color} strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <h2 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.5rem' : '1.8rem',
                      fontWeight: '600',
                      margin: 0,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      {isEditingEvent ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
                    </h2>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      marginTop: '0.3rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                    }}>
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
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </motion.button>
              </div>
              
              {/* Form Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1.5rem' : '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.8rem'
              }}>
                {/* Title Input */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.8rem'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      Judul Kegiatan *
                    </label>
                  </div>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => handleFormInputChange('title', e.target.value)}
                    placeholder="Masukkan judul kegiatan"
                    style={{
                      width: '100%',
                      padding: '1rem 1.2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  />
                </div>
                
                {/* Description Input */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.8rem'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      Deskripsi
                    </label>
                  </div>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => handleFormInputChange('description', e.target.value)}
                    placeholder="Masukkan deskripsi kegiatan"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '1rem 1.2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      resize: 'vertical',
                      minHeight: '120px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  />
                </div>
                
                {/* Date and Time */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '1.5rem'
                }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.8rem'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <label style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                        fontWeight: '500'
                      }}>
                        Tanggal
                      </label>
                    </div>
                    <input
                      type="date"
                      value={eventForm.date.toISOString().split('T')[0]}
                      onChange={(e) => handleFormInputChange('date', new Date(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '1rem 1.2rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.8rem'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <label style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                        fontWeight: '500'
                      }}>
                        Waktu
                      </label>
                    </div>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => handleFormInputChange('time', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem 1.2rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                
                {/* Color Selection */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.8rem'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    </svg>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      Warna
                    </label>
                  </div>
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
                          width: '44px',
                          height: '44px',
                          backgroundColor: color.value,
                          border: eventForm.color === color.value ? '3px solid white' : '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          color: 'white',
                          fontWeight: '600',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {eventForm.color === color.value && (
                          <>
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)'
                            }} />
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          </>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Label Selection */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.8rem'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2">
                      <path d="M7 7h10v10l-5 5-5-5V7z"/>
                      <path d="M7 7l5-5 5 5"/>
                    </svg>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      Label
                    </label>
                  </div>
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
                          padding: '0.6rem 1.2rem',
                          backgroundColor: eventForm.label === label.value ? eventForm.color + '30' : 'rgba(255, 255, 255, 0.05)',
                          border: eventForm.label === label.value ? `1px solid ${eventForm.color}` : '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '25px',
                          color: eventForm.label === label.value ? eventForm.color : 'white',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                          whiteSpace: 'nowrap',
                          fontWeight: eventForm.label === label.value ? '600' : '400',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                        whileHover={{ 
                          backgroundColor: eventForm.label === label.value ? eventForm.color + '40' : 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        }}
                      >
                        {eventForm.label === label.value && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={eventForm.color} strokeWidth="3">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        )}
                        {label.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* User Info */}
                {user && (
                  <div style={{
                    padding: '1.2rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: eventForm.color + '20',
                        border: `1px solid ${eventForm.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: eventForm.color
                      }}>
                        {userDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '600',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                        }}>
                          {userDisplayName}
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            backgroundColor: isAdmin ? eventForm.color + '20' : 'rgba(255, 255, 255, 0.1)',
                            color: isAdmin ? eventForm.color : 'rgba(255, 255, 255, 0.8)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {isAdmin ? 'Admin' : 'User'}
                          </span>
                          • {userEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer Modal */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                flexShrink: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}>
                <motion.button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setIsEditingEvent(false);
                    setEditingEventId(null);
                  }}
                  style={{
                    padding: '0.9rem 1.8rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  Batal
                </motion.button>
                
                <motion.button
                  onClick={handleSubmitEvent}
                  disabled={!eventForm.title.trim()}
                  style={{
                    padding: '0.9rem 1.8rem',
                    backgroundColor: eventForm.title.trim() ? eventForm.color : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    color: eventForm.title.trim() ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: eventForm.title.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                  whileHover={eventForm.title.trim() ? { 
                    backgroundColor: eventForm.color,
                    filter: 'brightness(1.2)',
                    transform: 'translateY(-2px)'
                  } : {}}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {isEditingEvent ? 'Update Kegiatan' : 'Simpan Kegiatan'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal Event Details - DESIGN LEBIH BAGUS */}
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
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
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
                borderBottom: `1px solid ${selectedEvent.color}20`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexShrink: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', flexWrap: 'wrap', flex: 1 }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: selectedEvent.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selectedEvent.color} strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.6rem' : '1.9rem',
                      fontWeight: '600',
                      margin: '0 0 0.8rem 0',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px',
                      lineHeight: 1.3
                    }}>
                      {selectedEvent.title}
                    </h2>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        backgroundColor: selectedEvent.color + '20',
                        color: selectedEvent.color,
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        padding: '0.4rem 1rem',
                        borderRadius: '25px',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        border: `1px solid ${selectedEvent.color}`
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                        {selectedEvent.label}
                      </div>
                      
                      {selectedEvent.isAdmin && (
                        <div style={{
                          backgroundColor: selectedEvent.color + '10',
                          color: selectedEvent.color,
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          padding: '0.4rem 1rem',
                          borderRadius: '25px',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          border: `1px solid ${selectedEvent.color}30`
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
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
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                    flexShrink: 0
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </motion.button>
              </div>
              
              {/* Event Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1.5rem' : '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}>
                {/* Date and Time Section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  padding: '1.2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: selectedEvent.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={selectedEvent.color} strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      marginBottom: '0.3rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                    }}>
                      {formatDate(selectedEvent.date instanceof Date ? selectedEvent.date : selectedEvent.date.toDate())}
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1rem',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {formatTime(selectedEvent.date instanceof Date ? selectedEvent.date : selectedEvent.date.toDate(), selectedEvent.time)} WIB
                    </div>
                  </div>
                </div>
                
                {/* Description Section */}
                {selectedEvent.description && (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      marginBottom: '1rem'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedEvent.color} strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <h3 style={{
                        color: 'white',
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        margin: 0,
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                      }}>
                        Deskripsi
                      </h3>
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.05rem',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                    }}>
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
                
                {/* Created By Section */}
                <div style={{
                  padding: '1.2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.2rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: selectedEvent.color + '20',
                      border: `2px solid ${selectedEvent.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: selectedEvent.color
                    }}>
                      {selectedEvent.createdBy.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        flexWrap: 'wrap',
                        marginBottom: '0.3rem'
                      }}>
                        <div style={{
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                        }}>
                          {selectedEvent.createdBy}
                        </div>
                        {selectedEvent.isAdmin && (
                          <div style={{
                            backgroundColor: selectedEvent.color + '15',
                            color: selectedEvent.color,
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '0.2rem 0.8rem',
                            borderRadius: '12px',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                              <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            ADMIN
                          </div>
                        )}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.95rem',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                        wordBreak: 'break-all'
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
                borderTop: `1px solid ${selectedEvent.color}20`,
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                flexShrink: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.8rem',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
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
                          backgroundColor: selectedEvent.color + '15',
                          border: `1px solid ${selectedEvent.color}30`,
                          borderRadius: '10px',
                          color: selectedEvent.color,
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}
                        whileHover={{ 
                          backgroundColor: selectedEvent.color + '25',
                          transform: 'translateY(-2px)'
                        }}
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
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '10px',
                          color: '#EF4444',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}
                        whileHover={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          transform: 'translateY(-2px)'
                        }}
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
                fontWeight: '500',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
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
