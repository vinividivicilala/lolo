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
  deleteDoc,
  getDocs,
  writeBatch,
  where
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

// Type untuk notifikasi
interface Notification {
  id: string;
  eventId: string;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  createdBy: string;
  createdAt: Timestamp | Date;
}

// Type untuk saved event
interface SavedEvent {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  title: string;
  date: Date;
  savedAt: Timestamp | Date;
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
  
  // State untuk notifikasi
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  // State untuk saved events
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [showSavedEvents, setShowSavedEvents] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  
  // Ref
  const addEventModalRef = useRef<HTMLDivElement>(null);
  const eventDetailsModalRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const savedEventsRef = useRef<HTMLDivElement>(null);
  
  // Label preset saja (warna dihapus)
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
  
  // Fungsi untuk membuat notifikasi
  const createNotification = async (eventId: string, eventTitle: string, createdBy: string) => {
    if (!db || !userEmail) return;
    
    try {
      const notificationData = {
        eventId,
        title: "Kegiatan Baru Ditambahkan",
        message: `${createdBy} telah menambahkan kegiatan "${eventTitle}"`,
        date: new Date(),
        isRead: false,
        createdBy,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'notifications'), notificationData);
      console.log("✅ Notification created for event:", eventId);
    } catch (error) {
      console.error("❌ Error creating notification:", error);
    }
  };
  
  // Fungsi untuk mark notifikasi sebagai read
  const markNotificationsAsRead = async () => {
    if (!db || !userEmail) return;
    
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('isRead', '==', false));
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.forEach((docSnapshot) => {
        const notificationRef = doc(db, 'notifications', docSnapshot.id);
        batch.update(notificationRef, { isRead: true });
      });
      
      await batch.commit();
      setUnreadNotifications(0);
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        isRead: true
      })));
      
    } catch (error) {
      console.error("❌ Error marking notifications as read:", error);
    }
  };
  
  // Fungsi untuk save event
  const handleSaveEvent = async (event: CalendarEvent) => {
    if (!db || !user || isSavingEvent) return;
    
    setIsSavingEvent(true);
    
    // Cek apakah event sudah disimpan
    const alreadySaved = savedEvents.some(saved => saved.eventId === event.id);
    if (alreadySaved) {
      alert("Kegiatan ini sudah disimpan!");
      setIsSavingEvent(false);
      return;
    }
    
    try {
      const savedEventData = {
        eventId: event.id,
        userId: user.uid,
        userEmail: userEmail,
        title: event.title,
        date: event.date instanceof Date ? event.date : event.date.toDate(),
        savedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'savedEvents'), savedEventData);
      console.log("✅ Event saved:", docRef.id);
      
      // Refresh saved events
      loadSavedEvents();
      
      alert("Kegiatan berhasil disimpan! Lihat di riwayat save Anda.");
    } catch (error) {
      console.error("❌ Error saving event:", error);
      alert("Gagal menyimpan kegiatan. Silakan coba lagi.");
    } finally {
      setIsSavingEvent(false);
    }
  };
  
  // Fungsi untuk load saved events
  const loadSavedEvents = async () => {
    if (!db || !user) return;
    
    try {
      const savedEventsRef = collection(db, 'savedEvents');
      const q = query(savedEventsRef, where('userId', '==', user.uid), orderBy('savedAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const savedData: SavedEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let savedDate = data.date;
        
        if (savedDate && typeof savedDate.toDate === 'function') {
          savedDate = savedDate.toDate();
        } else if (typeof savedDate === 'string') {
          savedDate = new Date(savedDate);
        } else if (!savedDate) {
          savedDate = new Date();
        }
        
        savedData.push({
          id: doc.id,
          eventId: data.eventId || '',
          userId: data.userId || '',
          userEmail: data.userEmail || '',
          title: data.title || 'No Title',
          date: savedDate,
          savedAt: data.savedAt || new Date()
        });
      });
      
      setSavedEvents(savedData);
    } catch (error) {
      console.error("❌ Error loading saved events:", error);
    }
  };
  
  // Fungsi untuk menghapus saved event
  const handleRemoveSavedEvent = async (savedEventId: string) => {
    if (!db) return;
    
    if (!confirm("Apakah Anda yakin ingin menghapus dari daftar save?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'savedEvents', savedEventId));
      console.log("✅ Saved event removed:", savedEventId);
      loadSavedEvents();
      alert("Kegiatan dihapus dari daftar save!");
    } catch (error) {
      console.error("❌ Error removing saved event:", error);
      alert("Gagal menghapus dari daftar save.");
    }
  };
  
  // Load user dan events dari Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserDisplayName(currentUser.displayName || currentUser.email?.split('@')[0] || 'User');
        setUserEmail(currentUser.email || '');
        setIsAdmin(checkIfAdmin(currentUser.email || ''));
        
        // Load saved events untuk user ini
        loadSavedEvents();
      } else {
        setUser(null);
        setUserDisplayName('');
        setUserEmail('');
        setIsAdmin(false);
        setSavedEvents([]);
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
          } else if (!eventDate) {
            eventDate = new Date();
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
  
  // Load notifications dari Firebase
  useEffect(() => {
    if (!db) return;
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const notificationsData: Notification[] = [];
        let unreadCount = 0;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let notificationDate = data.date;
          
          // FIX: Handle undefined date safely
          if (notificationDate && typeof notificationDate.toDate === 'function') {
            notificationDate = notificationDate.toDate();
          } else if (typeof notificationDate === 'string') {
            notificationDate = new Date(notificationDate);
          } else if (!notificationDate) {
            notificationDate = new Date();
          }
          
          notificationsData.push({
            id: doc.id,
            eventId: data.eventId || '',
            title: data.title || "Notification",
            message: data.message || "",
            date: notificationDate,
            isRead: data.isRead || false,
            createdBy: data.createdBy || "System",
            createdAt: data.createdAt || new Date()
          });
          
          if (!data.isRead) {
            unreadCount++;
          }
        });
        
        setNotifications(notificationsData);
        setUnreadNotifications(unreadCount);
        
        // Blink effect jika ada notifikasi baru
        if (unreadCount > 0) {
          setIsBlinking(true);
          const blinkInterval = setInterval(() => {
            setIsBlinking(prev => !prev);
          }, 800);
          
          return () => clearInterval(blinkInterval);
        } else {
          setIsBlinking(false);
        }
      },
      (error) => {
        console.error("❌ Error loading notifications:", error);
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
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (savedEventsRef.current && !savedEventsRef.current.contains(event.target as Node)) {
        setShowSavedEvents(false);
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
      
      let eventId = "";
      
      if (isEditingEvent && editingEventId) {
        // Update existing event
        const eventRef = doc(db, 'calendarEvents', editingEventId);
        await updateDoc(eventRef, eventData);
        eventId = editingEventId;
        console.log("✅ Event updated:", editingEventId);
      } else {
        // Add new event
        const docRef = await addDoc(collection(db, 'calendarEvents'), eventData);
        eventId = docRef.id;
        console.log("✅ Event added with ID:", docRef.id);
        
        // Buat notifikasi hanya untuk event baru (bukan edit)
        if (isAdmin) {
          await createNotification(eventId, eventForm.title.trim(), userDisplayName);
        }
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
        if (showNotifications) {
          setShowNotifications(false);
        }
        if (showSavedEvents) {
          setShowSavedEvents(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddEventModal, showEventDetailsModal, showNotifications, showSavedEvents]);
  
  // Animasi untuk modal
  useEffect(() => {
    if (showAddEventModal || showEventDetailsModal || showNotifications || showSavedEvents) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddEventModal, showEventDetailsModal, showNotifications, showSavedEvents]);
  
  // Hitung total event
  const totalEventsThisYear = getTotalEventsThisYear();
  
  // Fungsi untuk format tanggal saved event
  const formatSavedDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Hari ini";
    } else if (diffDays === 1) {
      return "Kemarin";
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} minggu lalu`;
    } else {
      return `${date.getDate()} ${getShortMonthName(date.getMonth())} ${date.getFullYear()}`;
    }
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
      
      {/* Header dengan Back Button - TEKS & PANAH DIPERBESAR */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem 1rem' : '2rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'black',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Back Button kiri - DIPERBESAR */}
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
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontFamily: 'Helvetica, Arial, sans-serif',
              padding: '0.5rem',
              gap: '0.5rem',
              fontWeight: '400'
            }}
            whileHover={{ opacity: 0.7 }}
          >
            {/* North West Arrow Icon - DIPERBESAR */}
            <svg 
              width={isMobile ? "28" : "32"} 
              height={isMobile ? "28" : "32"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path d="M7 17L17 7"/>
              <path d="M7 7H17V17"/>
            </svg>
            
            <span style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: '400',
              color: 'white',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Halaman utama
            </span>
          </motion.button>
        </div>
        
        {/* Judul kalender di tengah - DIPERBESAR */}
        <div style={{
          flex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.3rem'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '1.8rem' : '2.4rem',
            fontWeight: '400',
            margin: 0,
            fontFamily: 'Helvetica, Arial, sans-serif',
            letterSpacing: '0.5px',
            lineHeight: 1.2
          }}>
            Kalender MENURU
          </h1>
          
          {/* Tahun + Total Event - DIPERBESAR */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginTop: '0.3rem'
          }}>
            <div style={{
              color: 'white',
              fontSize: isMobile ? '1.2rem' : '1.5rem',
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
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                  fontWeight: '400',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  {totalEventsThisYear}
                </span>
                <span style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                  fontWeight: '400',
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  Event
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nama user di bagian tengah kanan dengan panah NORTH WEST ARROW - DIPERBESAR */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {/* Notifikasi Bell Icon dengan counter - BESAR */}
          {user && (
            <div style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setShowNotifications(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  padding: '0.5rem'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Bell Icon BESAR */}
                <svg 
                  width={isMobile ? "32" : "40"} 
                  height={isMobile ? "32" : "40"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                
                {/* Blink Dot Pemancar - BESAR dan JELAS */}
                {unreadNotifications > 0 && (
                  <motion.div
                    animate={{
                      scale: isBlinking ? [1, 1.5, 1] : 1,
                      opacity: isBlinking ? [1, 0.5, 1] : 1
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: isMobile ? '14px' : '18px',
                      height: isMobile ? '14px' : '18px',
                      backgroundColor: '#FF3B30',
                      borderRadius: '50%',
                      border: '2px solid black',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{
                      color: 'white',
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      fontWeight: 'bold',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  </motion.div>
                )}
              </motion.button>
            </div>
          )}
          
          {/* Save Events Icon - BESAR */}
          {user && (
            <div style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setShowSavedEvents(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Bookmark Icon BESAR */}
                <svg 
                  width={isMobile ? "32" : "40"} 
                  height={isMobile ? "32" : "40"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                
                {/* Counter untuk saved events */}
                {savedEvents.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: isMobile ? '14px' : '18px',
                    height: isMobile ? '14px' : '18px',
                    backgroundColor: '#3B82F6',
                    borderRadius: '50%',
                    border: '2px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      fontWeight: 'bold',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {savedEvents.length > 9 ? '9+' : savedEvents.length}
                    </span>
                  </div>
                )}
              </motion.button>
            </div>
          )}
          
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              {/* Tanda panah NORTH WEST ARROW BESAR di samping kiri nama user - DIPERBESAR */}
              <svg 
                width={isMobile ? "28" : "36"} 
                height={isMobile ? "28" : "36"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.5"
                style={{ display: 'block' }}
              >
                <path d="M7 17L17 7" stroke="white" strokeWidth="2.5"/>
                <path d="M7 7H17V17" stroke="white" strokeWidth="2.5"/>
              </svg>
              
              {/* Nama user BESAR - DIPERBESAR */}
              <span style={{
                fontSize: isMobile ? '1.6rem' : '2.2rem',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.95)',
                fontFamily: 'Helvetica, Arial, sans-serif',
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
        marginTop: isMobile ? '9rem' : '12rem',
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
          backgroundColor: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '15px'
        }}>
          {/* Navigasi Bulan */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <motion.button
              onClick={() => navigateMonth('prev')}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </motion.button>
            
            <div style={{
              color: 'white',
              fontSize: isMobile ? '1.6rem' : '2rem',
              fontWeight: '400',
              fontFamily: 'Helvetica, Arial, sans-serif',
              minWidth: '250px',
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
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  padding: '0.6rem 1.2rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '1rem',
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
                  padding: '0.5rem 1rem',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  minWidth: '45px',
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
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: '600',
                textAlign: 'center',
                padding: '0.8rem',
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
                return <div key={`empty-${index}`} style={{ height: isMobile ? '100px' : '140px' }} />;
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
                    padding: '1rem',
                    minHeight: isMobile ? '100px' : '140px',
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
                    fontSize: isMobile ? '1.2rem' : '1.3rem',
                    fontWeight: day.isToday ? '700' : '400',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'Helvetica, Arial, sans-serif'
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
                  
                  {/* Event Indicators - MINIMALIST */}
                  {hasEvents && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      maxHeight: isMobile ? '65px' : '100px',
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
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '0.3rem 0.5rem',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{
                            color: 'white',
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontFamily: 'Helvetica, Arial, sans-serif'
                          }}>
                            {event.title}
                          </div>
                        </div>
                      ))}
                      {day.events.length > 3 && (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          textAlign: 'center',
                          padding: '0.2rem',
                          fontFamily: 'Helvetica, Arial, sans-serif'
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
                        bottom: '0.5rem',
                        right: '0.5rem',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: 'white',
                        fontFamily: 'Helvetica, Arial, sans-serif'
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
      </div>
      
      {/* Modal Add/Edit Event - DENGAN NORTH WEST ARROW BESAR & TANPA WARNA */}
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
              {/* Header Modal dengan North West Arrow BESAR */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* North West Arrow Icon BESAR */}
                  <svg 
                    width={isMobile ? "32" : "40"} 
                    height={isMobile ? "32" : "40"} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                  >
                    <path d="M7 17L17 7"/>
                    <path d="M7 7H17V17"/>
                  </svg>
                  
                  <h2 style={{
                    color: 'white',
                    fontSize: isMobile ? '1.6rem' : '2rem',
                    fontWeight: '400',
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '0.5px'
                  }}>
                    {isEditingEvent ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
                  </h2>
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
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  ×
                </motion.button>
              </div>
              
              {/* Form Content - TANPA PILIHAN WARNA */}
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
                    fontSize: '1.1rem',
                    marginBottom: '0.8rem',
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
                      padding: '1rem 1.2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1.1rem',
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
                    fontSize: '1.1rem',
                    marginBottom: '0.8rem',
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
                      padding: '1rem 1.2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      resize: 'vertical',
                      minHeight: '120px'
                    }}
                  />
                </div>
                
                {/* Date and Time */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1.1rem',
                      marginBottom: '0.8rem',
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
                        padding: '1rem 1.2rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1.1rem',
                      marginBottom: '0.8rem',
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
                        padding: '1rem 1.2rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                
                {/* Label Selection */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.1rem',
                    marginBottom: '0.8rem',
                    display: 'block',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: '400'
                  }}>
                    Kategori
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
                          padding: '0.6rem 1.2rem',
                          backgroundColor: eventForm.label === label.value ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '20px',
                          color: 'white',
                          fontSize: '0.9rem',
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
                
                {/* User Info dengan North West Arrow */}
                {user && (
                  <div style={{
                    padding: '1.2rem',
                    backgroundColor: 'transparent',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      {/* North West Arrow Icon untuk User */}
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                      >
                        <path d="M7 17L17 7"/>
                        <path d="M7 7H17V17"/>
                      </svg>
                      
                      <div>
                        <div style={{
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: '500',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          {userDisplayName}
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}>
                          {userEmail}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      padding: '0.3rem 0.8rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px'
                    }}>
                      {isAdmin ? 'Admin' : 'User'}
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
                gap: '1.2rem',
                flexShrink: 0
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
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '1rem',
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
                    padding: '0.9rem 1.8rem',
                    backgroundColor: eventForm.title.trim() ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                    border: eventForm.title.trim() ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: eventForm.title.trim() ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '1rem',
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
      
      {/* Modal Event Details - DESIGN TABEL MINIMALIST DENGAN TEKS BESAR */}
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
                maxWidth: '700px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Header Modal dengan North West Arrow BESAR */}
              <div style={{
                padding: isMobile ? '1.8rem' : '2.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {/* North West Arrow Icon - BESAR */}
                  <svg 
                    width={isMobile ? "32" : "40"} 
                    height={isMobile ? "32" : "40"} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                  >
                    <path d="M7 17L17 7"/>
                    <path d="M7 7H17V17"/>
                  </svg>
                  
                  <div>
                    <h2 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.8rem' : '2.2rem',
                      fontWeight: '400',
                      margin: '0 0 0.8rem 0',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      {selectedEvent.title}
                    </h2>
                    
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '1.1rem',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {selectedEvent.label}
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
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  ×
                </motion.button>
              </div>
              
              {/* Event Content dalam bentuk tabel dengan TEKS BESAR */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1.8rem' : '2.5rem'
              }}>
                {/* Tabel Informasi Event - TEKS BESAR */}
                <div style={{
                  display: 'table',
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  
                  {/* Baris Tanggal */}
                  <div style={{
                    display: 'table-row',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <div style={{
                      display: 'table-cell',
                      padding: '1.5rem 0',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: isMobile ? '1.2rem' : '1.4rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      width: isMobile ? '100px' : '120px',
                      verticalAlign: 'top',
                      fontWeight: '400'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Tanggal
                      </div>
                    </div>
                    <div style={{
                      display: 'table-cell',
                      padding: '1.5rem 0 1.5rem 1.5rem',
                      color: 'white',
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      verticalAlign: 'top',
                      fontWeight: '400'
                    }}>
                      {formatDate(selectedEvent.date instanceof Date ? selectedEvent.date : selectedEvent.date.toDate())}
                    </div>
                  </div>
                  
                  {/* Baris Waktu */}
                  <div style={{
                    display: 'table-row',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <div style={{
                      display: 'table-cell',
                      padding: '1.5rem 0',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: isMobile ? '1.2rem' : '1.4rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      width: isMobile ? '100px' : '120px',
                      verticalAlign: 'top',
                      fontWeight: '400'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Waktu
                      </div>
                    </div>
                    <div style={{
                      display: 'table-cell',
                      padding: '1.5rem 0 1.5rem 1.5rem',
                      color: 'white',
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      verticalAlign: 'top',
                      fontWeight: '400'
                    }}>
                      {formatTime(selectedEvent.date instanceof Date ? selectedEvent.date : selectedEvent.date.toDate(), selectedEvent.time)} WIB
                    </div>
                  </div>
                  
                  {/* Baris Deskripsi */}
                  {selectedEvent.description && (
                    <div style={{
                      display: 'table-row',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                      <div style={{
                        display: 'table-cell',
                        padding: '1.5rem 0',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: isMobile ? '1.2rem' : '1.4rem',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        width: isMobile ? '100px' : '120px',
                        verticalAlign: 'top',
                        fontWeight: '400'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                          Deskripsi
                        </div>
                      </div>
                      <div style={{
                        display: 'table-cell',
                        padding: '1.5rem 0 1.5rem 1.5rem',
                        color: 'white',
                        fontSize: isMobile ? '1.3rem' : '1.5rem',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        lineHeight: 1.6,
                        verticalAlign: 'top',
                        whiteSpace: 'pre-wrap',
                        fontWeight: '400'
                      }}>
                        {selectedEvent.description}
                      </div>
                    </div>
                  )}
                  
                  {/* Baris Dibuat Oleh */}
                  <div style={{
                    display: 'table-row'
                  }}>
                    <div style={{
                      display: 'table-cell',
                      padding: '1.5rem 0',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: isMobile ? '1.2rem' : '1.4rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      width: isMobile ? '100px' : '120px',
                      verticalAlign: 'top',
                      fontWeight: '400'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Dibuat Oleh
                      </div>
                    </div>
                    <div style={{
                      display: 'table-cell',
                      padding: '1.5rem 0 1.5rem 1.5rem',
                      color: 'white',
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      verticalAlign: 'top',
                      fontWeight: '400'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.8rem'
                        }}>
                          {/* North West Arrow Icon di samping nama pembuat - BESAR */}
                          <svg 
                            width={isMobile ? "20" : "24"} 
                            height={isMobile ? "20" : "24"} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="2"
                          >
                            <path d="M7 17L17 7"/>
                            <path d="M7 7H17V17"/>
                          </svg>
                          <div>
                            <div style={{
                              color: 'white',
                              fontSize: '1.2rem',
                              fontWeight: '500',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}>
                              {selectedEvent.createdBy}
                            </div>
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '1rem',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}>
                              {selectedEvent.createdByEmail}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Modal dengan Actions */}
              <div style={{
                padding: isMobile ? '1.8rem' : '2.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexShrink: 0
              }}>
                {/* Save Button untuk User */}
                {user && !isAdmin && (
                  <motion.button
                    onClick={() => handleSaveEvent(selectedEvent)}
                    disabled={isSavingEvent}
                    style={{
                      padding: '0.8rem 1.5rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '400',
                      cursor: isSavingEvent ? 'not-allowed' : 'pointer',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      opacity: isSavingEvent ? 0.7 : 1
                    }}
                    whileHover={!isSavingEvent ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : {}}
                  >
                    {isSavingEvent ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        Save Kegiatan
                      </>
                    )}
                  </motion.button>
                )}
                
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginLeft: 'auto'
                }}>
                  {isAdmin && (
                    <>
                      <motion.button
                        onClick={() => handleEditEvent(selectedEvent)}
                        style={{
                          padding: '0.8rem 1.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
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
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
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
      
      {/* Modal Notifications */}
      <AnimatePresence>
        {showNotifications && (
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
              ref={notificationsRef}
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
              {/* Header Modal Notifications */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* Bell Icon BESAR */}
                  <svg 
                    width={isMobile ? "32" : "40"} 
                    height={isMobile ? "32" : "40"} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  
                  <h2 style={{
                    color: 'white',
                    fontSize: isMobile ? '1.6rem' : '2rem',
                    fontWeight: '400',
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '0.5px'
                  }}>
                    Notifikasi
                    {unreadNotifications > 0 && (
                      <span style={{
                        marginLeft: '0.8rem',
                        backgroundColor: '#FF3B30',
                        color: 'white',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {unreadNotifications} baru
                      </span>
                    )}
                  </h2>
                </div>
                
                <motion.button
                  onClick={() => {
                    setShowNotifications(false);
                    markNotificationsAsRead();
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  ×
                </motion.button>
              </div>
              
              {/* Notifications Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1rem' : '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '1.1rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Tidak ada notifikasi
                  </div>
                ) : (
                  notifications.map((notification) => {
                    // FIX: Handle undefined date safely
                    const notificationDate = notification.date instanceof Date ? 
                      notification.date : 
                      (notification.date && typeof notification.date.toDate === 'function' ? 
                        notification.date.toDate() : 
                        new Date());
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          backgroundColor: notification.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          padding: '1.2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            fontFamily: 'Helvetica, Arial, sans-serif'
                          }}>
                            {notification.title}
                          </div>
                          {!notification.isRead && (
                            <div style={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: '#FF3B30',
                              borderRadius: '50%'
                            }} />
                          )}
                        </div>
                        
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '1rem',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          lineHeight: 1.4
                        }}>
                          {notification.message}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '0.5rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.9rem',
                            fontFamily: 'Helvetica, Arial, sans-serif'
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {formatDate(notificationDate)}
                          </div>
                          
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontFamily: 'Helvetica, Arial, sans-serif'
                          }}>
                            oleh {notification.createdBy}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
              
              {/* Footer Notifications */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1.2rem',
                flexShrink: 0
              }}>
                <motion.button
                  onClick={() => {
                    setShowNotifications(false);
                    markNotificationsAsRead();
                  }}
                  style={{
                    padding: '0.9rem 1.8rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  Tutup
                </motion.button>
                
                {unreadNotifications > 0 && (
                  <motion.button
                    onClick={markNotificationsAsRead}
                    style={{
                      padding: '0.9rem 1.8rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '400',
                      cursor: 'pointer',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    Tandai Sudah Dibaca
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal Saved Events */}
      <AnimatePresence>
        {showSavedEvents && (
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
              ref={savedEventsRef}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: 'transparent',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Header Modal Saved Events */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* Bookmark Icon BESAR */}
                  <svg 
                    width={isMobile ? "32" : "40"} 
                    height={isMobile ? "32" : "40"} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  
                  <h2 style={{
                    color: 'white',
                    fontSize: isMobile ? '1.6rem' : '2rem',
                    fontWeight: '400',
                    margin: 0,
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '0.5px'
                  }}>
                    Kegiatan Tersimpan
                    <span style={{
                      marginLeft: '0.8rem',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {savedEvents.length} kegiatan
                    </span>
                  </h2>
                </div>
                
                <motion.button
                  onClick={() => setShowSavedEvents(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  ×
                </motion.button>
              </div>
              
              {/* Saved Events Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '1rem' : '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {savedEvents.length === 0 ? (
                  <div style={{
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '1.1rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Belum ada kegiatan yang disimpan
                  </div>
                ) : (
                  savedEvents.map((savedEvent) => {
                    // FIX: Handle undefined date safely
                    const savedDate = savedEvent.date instanceof Date ? 
                      savedEvent.date : 
                      (savedEvent.date && typeof savedEvent.date.toDate === 'function' ? 
                        savedEvent.date.toDate() : 
                        new Date());
                    
                    return (
                      <motion.div
                        key={savedEvent.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          padding: '1.2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.8rem'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                          }}>
                            {/* North West Arrow Icon di setiap saved event - BESAR */}
                            <svg 
                              width={isMobile ? "20" : "24"} 
                              height={isMobile ? "20" : "24"} 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="2"
                            >
                              <path d="M7 17L17 7"/>
                              <path d="M7 7H17V17"/>
                            </svg>
                            
                            <div style={{
                              color: 'white',
                              fontSize: '1.1rem',
                              fontWeight: '500',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}>
                              {savedEvent.title}
                            </div>
                          </div>
                          
                          <motion.button
                            onClick={() => handleRemoveSavedEvent(savedEvent.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            ×
                          </motion.button>
                        </div>
                        
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.95rem',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          paddingLeft: '2rem'
                        }}>
                          Tanggal: {formatDate(savedDate)}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingLeft: '2rem'
                        }}>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.9rem',
                            fontFamily: 'Helvetica, Arial, sans-serif'
                          }}>
                            Disimpan {formatSavedDate(savedDate)}
                          </div>
                          
                          <motion.button
                            onClick={() => {
                              const originalEvent = calendarEvents.find(e => e.id === savedEvent.eventId);
                              if (originalEvent) {
                                handleViewEventDetails(originalEvent);
                                setShowSavedEvents(false);
                              }
                            }}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '6px',
                              color: 'white',
                              fontSize: '0.8rem',
                              fontWeight: '400',
                              cursor: 'pointer',
                              fontFamily: 'Helvetica, Arial, sans-serif'
                            }}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            Lihat Detail
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
              
              {/* Footer Saved Events */}
              <div style={{
                padding: isMobile ? '1.5rem' : '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1.2rem',
                flexShrink: 0
              }}>
                <motion.button
                  onClick={() => setShowSavedEvents(false)}
                  style={{
                    padding: '0.9rem 1.8rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  Tutup
                </motion.button>
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
              textAlign: 'center',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ marginBottom: '1.5rem' }}
              >
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </motion.div>
              <div style={{
                fontSize: '1.4rem',
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
