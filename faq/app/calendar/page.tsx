'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
  createdAt: Date;
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
  
  // State untuk kalender
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  const addEventModalRef = useRef<HTMLDivElement>(null);
  const eventDetailsModalRef = useRef<HTMLDivElement>(null);
  
  // Label preset
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
  
  // Fungsi untuk mendapatkan hari dalam seminggu
  const getDayName = (dayIndex: number): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
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
        const eventDate = event.date;
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
  
  // Handler untuk form input
  const handleFormInputChange = (field: keyof EventFormData, value: string | Date) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handler untuk submit event baru
  const handleSubmitEvent = async () => {
    if (!eventForm.title.trim()) {
      alert("Judul kegiatan tidak boleh kosong!");
      return;
    }
    
    try {
      // Combine date and time
      const [hours, minutes] = eventForm.time.split(':');
      const eventDate = new Date(eventForm.date);
      eventDate.setHours(parseInt(hours), parseInt(minutes));
      
      const newEvent: CalendarEvent = {
        id: isEditingEvent && editingEventId ? editingEventId : Date.now().toString(),
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        date: eventDate,
        time: eventForm.time,
        color: eventForm.color,
        label: eventForm.label,
        createdBy: "Admin",
        createdByEmail: "admin@menuru.com",
        isAdmin: true,
        createdAt: new Date()
      };
      
      if (isEditingEvent && editingEventId) {
        // Update existing event
        setCalendarEvents(prev => 
          prev.map(event => 
            event.id === editingEventId ? newEvent : event
          )
        );
      } else {
        // Add new event
        setCalendarEvents(prev => [...prev, newEvent]);
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
    const eventDate = event.date;
    
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
    if (!confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      return;
    }
    
    try {
      setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
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
  
  // Contoh data dummy untuk demo
  useEffect(() => {
    // Set contoh event untuk demo
    setCalendarEvents([
      {
        id: "1",
        title: "Meeting Tim Development",
        description: "Membahas progress pengembangan fitur baru",
        date: new Date(2024, 2, 15),
        time: "14:00",
        color: "#3B82F6",
        label: "Meeting",
        createdBy: "Admin",
        createdByEmail: "admin@menuru.com",
        isAdmin: true,
        createdAt: new Date()
      },
      {
        id: "2",
        title: "Deadline Laporan Bulanan",
        description: "Pengumpulan laporan performa sistem bulan Maret",
        date: new Date(2024, 2, 20),
        time: "23:59",
        color: "#10B981",
        label: "Deadline",
        createdBy: "Admin",
        createdByEmail: "admin@menuru.com",
        isAdmin: true,
        createdAt: new Date()
      }
    ]);
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
              fontFamily: 'inherit',
              padding: '0.5rem',
              gap: '0.5rem',
              fontWeight: '400'
            }}
            whileHover={{ opacity: 0.7 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            <span style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: '400',
              color: 'white'
            }}>
              Back
            </span>
          </motion.button>
        </div>
        
        {/* Judul kalender di tengah */}
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
            fontFamily: 'inherit',
            letterSpacing: '-0.5px',
            lineHeight: 1.2
          }}>
            Calendar
          </h1>
          
          {/* Tahun + Bulan */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginTop: '0.3rem'
          }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: '400',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{currentYear}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>{getMonthName(currentMonth)}</span>
            </div>
          </div>
        </div>
        
        {/* Placeholder untuk alignment */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Kosong untuk menjaga simetri */}
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
          borderRadius: '12px'
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
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                width: '44px',
                height: '44px',
                borderRadius: '8px',
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
              fontSize: isMobile ? '1.3rem' : '1.6rem',
              fontWeight: '500',
              fontFamily: 'inherit',
              minWidth: '200px',
              textAlign: 'center'
            }}>
              {getMonthName(currentMonth)} {currentYear}
            </div>
            
            <motion.button
              onClick={() => navigateMonth('next')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                width: '44px',
                height: '44px',
                borderRadius: '8px',
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
            {[2023, 2024, 2025, 2026].map(year => (
              <motion.button
                key={year}
                onClick={() => handleYearSelect(year)}
                style={{
                  backgroundColor: currentYear === year ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  fontWeight: currentYear === year ? '500' : '400'
                }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                {year}
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
          {/* Header Hari - TEKS BESAR */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            padding: '0.5rem 0',
            marginBottom: '1rem'
          }}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: '600',
                textAlign: 'center',
                padding: '1rem 0',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid Tanggal - TEKS BESAR */}
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
                  borderRadius: '8px'
                }} />;
              }
              
              const hasEvents = day.events && day.events.length > 0;
              
              return (
                <motion.div
                  key={`day-${day.date}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.005 }}
                  onClick={() => handleDateSelect(day.fullDate)}
                  style={{
                    backgroundColor: day.isToday ? 'rgba(59, 130, 246, 0.2)' : 
                                   day.isSelected ? 'rgba(255, 255, 255, 0.1)' : 
                                   'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    padding: '1rem',
                    minHeight: isMobile ? '100px' : '140px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Tanggal - TEKS BESAR */}
                  <div style={{
                    color: day.isToday ? '#3B82F6' : 'rgba(255, 255, 255, 0.95)',
                    fontSize: isMobile ? '1.3rem' : '1.6rem',
                    fontWeight: day.isToday ? '700' : '500',
                    marginBottom: '0.5rem',
                    fontFamily: 'inherit',
                    textAlign: 'left'
                  }}>
                    {day.date}
                  </div>
                  
                  {/* Event Indicators */}
                  {hasEvents && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      flex: 1,
                      overflowY: 'auto'
                    }}>
                      {day.events.slice(0, 3).map(event => (
                        <motion.div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEventDetails(event);
                          }}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.4rem'
                          }}>
                            {/* Icon kecil */}
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '3px',
                              backgroundColor: event.color,
                              marginTop: '0.2rem',
                              flexShrink: 0
                            }} />
                            <div style={{
                              color: 'white',
                              fontSize: isMobile ? '0.75rem' : '0.85rem',
                              fontWeight: '500',
                              lineHeight: 1.2,
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {event.title}
                            </div>
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                            marginTop: '0.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {event.time}
                          </div>
                        </motion.div>
                      ))}
                      {day.events.length > 3 && (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          textAlign: 'center',
                          padding: '0.2rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px'
                        }}>
                          +{day.events.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Add Event Button */}
                  {!hasEvents && (
                    <motion.div
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 0.5 }}
                      whileHover={{ opacity: 1 }}
                      onClick={() => handleDateSelect(day.fullDate)}
                      style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1rem',
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
        
        {/* Instructions */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          marginTop: '1rem'
        }}>
          <h3 style={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontSize: '1.1rem',
            fontWeight: '500',
            margin: '0 0 1rem 0',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            Panduan
          </h3>
          <ul style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.95rem',
            margin: 0,
            paddingLeft: '1.5rem',
            lineHeight: 1.6,
            fontFamily: 'inherit'
          }}>
            <li>Klik pada tanggal untuk menambahkan kegiatan baru</li>
            <li>Klik pada kegiatan untuk melihat detail</li>
            <li>Tanggal hari ini ditandai dengan warna biru</li>
          </ul>
        </div>
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
                backgroundColor: '#0a0a0a',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <h2 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      fontWeight: '600',
                      margin: 0,
                      fontFamily: 'inherit',
                      letterSpacing: '-0.5px'
                    }}>
                      {isEditingEvent ? 'Edit Event' : 'New Event'}
                    </h2>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.9rem',
                      marginTop: '0.2rem',
                      fontFamily: 'inherit'
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
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontFamily: 'inherit'
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
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.95rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: 'inherit',
                    fontWeight: '500'
                  }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => handleFormInputChange('title', e.target.value)}
                    placeholder="Event title"
                    style={{
                      width: '100%',
                      padding: '0.9rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>
                
                {/* Description Input */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.95rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: 'inherit',
                    fontWeight: '500'
                  }}>
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => handleFormInputChange('description', e.target.value)}
                    placeholder="Event description"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.9rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      resize: 'vertical',
                      minHeight: '80px'
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
                      fontSize: '0.95rem',
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontFamily: 'inherit',
                      fontWeight: '500'
                    }}>
                      Date
                    </label>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" style={{
                        position: 'absolute',
                        left: '1rem',
                        pointerEvents: 'none'
                      }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <input
                        type="date"
                        value={eventForm.date.toISOString().split('T')[0]}
                        onChange={(e) => handleFormInputChange('date', new Date(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.9rem 1rem 0.9rem 3rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1rem',
                          fontFamily: 'inherit',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.95rem',
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontFamily: 'inherit',
                      fontWeight: '500'
                    }}>
                      Time
                    </label>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" style={{
                        position: 'absolute',
                        left: '1rem',
                        pointerEvents: 'none'
                      }}>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <input
                        type="time"
                        value={eventForm.time}
                        onChange={(e) => handleFormInputChange('time', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.9rem 1rem 0.9rem 3rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1rem',
                          fontFamily: 'inherit',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Label Selection */}
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.95rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: 'inherit',
                    fontWeight: '500'
                  }}>
                    Category
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
                          backgroundColor: eventForm.label === label.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          whiteSpace: 'nowrap',
                          fontWeight: eventForm.label === label.value ? '500' : '400',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        {eventForm.label === label.value && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                        {label.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
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
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleSubmitEvent}
                  disabled={!eventForm.title.trim()}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: eventForm.title.trim() ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: eventForm.title.trim() ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: eventForm.title.trim() ? '#3B82F6' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    cursor: eventForm.title.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit'
                  }}
                  whileHover={eventForm.title.trim() ? { backgroundColor: 'rgba(59, 130, 246, 0.3)' } : {}}
                >
                  {isEditingEvent ? 'Update Event' : 'Create Event'}
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
                backgroundColor: '#0a0a0a',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  
                  <div>
                    <h2 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      fontFamily: 'inherit',
                      letterSpacing: '-0.5px'
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
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '6px',
                        fontFamily: 'inherit'
                      }}>
                        {selectedEvent.label}
                      </div>
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
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontFamily: 'inherit'
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
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      marginBottom: '0.2rem',
                      fontFamily: 'inherit'
                    }}>
                      {formatDate(selectedEvent.date)}
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}>
                      {selectedEvent.time} • {getDayName(selectedEvent.date.getDay())}
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                      fontWeight: '500',
                      margin: '0 0 0.8rem 0',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      Description
                    </h3>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      padding: '0.8rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
                
                {/* Created By */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1rem',
                    fontWeight: '500',
                    margin: '0 0 0.8rem 0',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Created By
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#3B82F6',
                      flexShrink: 0
                    }}>
                      {selectedEvent.createdBy.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '500',
                        fontFamily: 'inherit'
                      }}>
                        {selectedEvent.createdBy}
                        {selectedEvent.isAdmin && (
                          <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3B82F6',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit'
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
                gap: '1rem',
                flexShrink: 0
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.8rem',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Created: {selectedEvent.createdAt.toLocaleDateString()}
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <motion.button
                    onClick={() => handleEditEvent(selectedEvent)}
                    style={{
                      padding: '0.8rem 1.2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
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
                      padding: '0.8rem 1.2rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      color: '#EF4444',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </motion.button>
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
                fontFamily: 'inherit',
                letterSpacing: '-0.5px'
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
