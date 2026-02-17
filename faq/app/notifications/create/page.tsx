'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getFirestore, 
  collection, 
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

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
let db = null;
let auth = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

interface NotificationForm {
  title: string;
  message: string;
  type: 'announcement' | 'maintenance' | 'system' | 'update' | 'alert' | 'info';
  scheduledDate?: string;
  scheduledTime?: string;
  recipientType: 'all' | 'specific' | 'email';
  recipientIds: string[];
  recipientEmails: string[];
  actionUrl?: string;
  links?: {
    youtube: string[];
    pdf: string[];
    images: string[];
    videos: string[];
    websites: string[];
  };
}

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
}

export default function CreateNotificationPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  
  // Calendar state
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [selectedMinute, setSelectedMinute] = useState<string>('');
  
  // Calendar options
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const [formData, setFormData] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'announcement',
    scheduledDate: '',
    scheduledTime: '',
    recipientType: 'all',
    recipientIds: [],
    recipientEmails: [],
    actionUrl: '',
  });

  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk preview link seperti di halaman notes
  const [linkPreview, setLinkPreview] = useState<{
    youtube: string[];
    pdf: string[];
    images: string[];
    videos: string[];
    websites: string[];
  }>({
    youtube: [],
    pdf: [],
    images: [],
    videos: [],
    websites: []
  });

  // Update current date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      setCurrentDateTime(now.toLocaleDateString('id-ID', options));
    };
    
    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Update scheduled date when calendar changes
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay && selectedHour && selectedMinute) {
      const monthIndex = (months.indexOf(selectedMonth) + 1).toString().padStart(2, '0');
      const dateString = `${selectedYear}-${monthIndex}-${selectedDay}`;
      const timeString = `${selectedHour}:${selectedMinute}`;
      
      setFormData(prev => ({
        ...prev,
        scheduledDate: dateString,
        scheduledTime: timeString
      }));
    }
  }, [selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute]);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Load all users
  useEffect(() => {
    if (!db) return;

    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.push({
            uid: doc.id,
            displayName: userData.displayName || userData.email || null,
            email: userData.email || null,
          });
        });
        
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [db]);

  // Fungsi untuk generate thumbnail (sama seperti di halaman notes)
  const generateThumbnail = (link: string): string => {
    if (!link) return "";
    
    try {
      const url = new URL(link);
      
      // YouTube
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId && videoId.length === 11) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      // Vimeo
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) {
          return `https://i.vimeocdn.com/video/${videoId}_640.jpg`;
        }
      }
      
      return "";
    } catch {
      return "";
    }
  };

  // Fungsi untuk mendapatkan embed URL (sama seperti di halaman notes)
  const getVideoEmbedUrl = (link: string): string | null => {
    if (!link) return null;
    
    try {
      const url = new URL(link);
      
      // YouTube
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId && videoId.length === 11) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
        }
      }
      
      // Vimeo
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
        }
      }
      
      // Video file langsung
      if (link.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) {
        return link;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Fungsi untuk mengekstrak links dari message (versi seperti di halaman notes)
  const extractLinksFromMessage = (message: string) => {
    console.log('Original message:', message);
    
    // URL regex yang lebih komprehensif
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // YouTube regex
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/g;
    
    // PDF regex
    const pdfRegex = /(https?:\/\/[^\s]+\.pdf)/gi;
    
    // Image regex
    const imageRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif))/gi;
    
    // Video regex
    const videoRegex = /(https?:\/\/[^\s]+\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v))/gi;
    
    // Ekstrak semua URL dulu
    const allUrls = message.match(urlRegex) || [];
    console.log('All URLs found:', allUrls);
    
    // Kategorikan URLs
    const youtubeLinks: string[] = [];
    const pdfLinks: string[] = [];
    const imageLinks: string[] = [];
    const videoLinks: string[] = [];
    const websiteLinks: string[] = [];
    
    allUrls.forEach(url => {
      // Cek YouTube
      if (url.match(youtubeRegex)) {
        youtubeLinks.push(url);
      }
      // Cek PDF
      else if (url.match(pdfRegex)) {
        pdfLinks.push(url);
      }
      // Cek Image
      else if (url.match(imageRegex)) {
        imageLinks.push(url);
      }
      // Cek Video
      else if (url.match(videoRegex)) {
        videoLinks.push(url);
      }
      // Sisanya sebagai website
      else {
        websiteLinks.push(url);
      }
    });
    
    const result = {
      youtube: [...new Set(youtubeLinks)],
      pdf: [...new Set(pdfLinks)],
      images: [...new Set(imageLinks)],
      videos: [...new Set(videoLinks)],
      websites: [...new Set(websiteLinks)]
    };
    
    console.log('Extracted links result:', result);
    
    return result;
  };

  // Update preview setiap kali message berubah
  useEffect(() => {
    if (formData.message) {
      const links = extractLinksFromMessage(formData.message);
      setLinkPreview(links);
    } else {
      setLinkPreview({
        youtube: [],
        pdf: [],
        images: [],
        videos: [],
        websites: []
      });
    }
  }, [formData.message]);

  const handleInputChange = (field: keyof NotificationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRecipientEmail = () => {
    if (newRecipientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipientEmail)) {
      setFormData(prev => ({
        ...prev,
        recipientEmails: [...new Set([...prev.recipientEmails, newRecipientEmail])]
      }));
      setNewRecipientEmail('');
    }
  };

  const removeRecipientEmail = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipientEmails: prev.recipientEmails.filter(e => e !== email)
    }));
  };

  const toggleUserSelection = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter(id => id !== userId)
        : [...prev.recipientIds, userId]
    }));
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (user.displayName?.toLowerCase().includes(query)) ||
      (user.email?.toLowerCase().includes(query))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !db) {
      alert('Please sign in to create notifications');
      return;
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Title and message are required');
      return;
    }

    if (formData.recipientType === 'specific' && formData.recipientIds.length === 0) {
      alert('Please select at least one user');
      return;
    }

    if (formData.recipientType === 'email' && formData.recipientEmails.length === 0) {
      alert('Please add at least one email address');
      return;
    }

    setIsLoading(true);

    try {
      const scheduledTime = formData.scheduledDate && formData.scheduledTime 
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        : null;

      // Ekstrak links dari message
      const extractedLinks = extractLinksFromMessage(formData.message.trim());
      
      // Hitung total links
      const linkCount = Object.values(extractedLinks).reduce((acc, arr) => acc + arr.length, 0);
      const hasLinks = linkCount > 0;

      console.log('Extracted Links:', extractedLinks);
      console.log('Link Count:', linkCount);
      console.log('Has Links:', hasLinks);

      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        scheduledTime: scheduledTime,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'User',
        senderEmail: user.email,
        recipientType: formData.recipientType,
        recipientIds: formData.recipientType === 'specific' ? formData.recipientIds : [],
        recipientEmails: formData.recipientType === 'email' ? formData.recipientEmails : [],
        isRead: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        actionUrl: formData.actionUrl?.trim() || '',
        userReads: {},
        status: scheduledTime ? 'scheduled' : 'sent',
        // Simpan links yang sudah diekstrak
        links: {
          youtube: extractedLinks.youtube || [],
          pdf: extractedLinks.pdf || [],
          images: extractedLinks.images || [],
          videos: extractedLinks.videos || [],
          websites: extractedLinks.websites || []
        },
        // Metadata untuk memudahkan query
        hasLinks: hasLinks,
        linkCount: linkCount,
        // Tambahkan timestamp untuk debugging
        createdAt_server: new Date().toISOString()
      };

      console.log('Final notification data:', JSON.stringify(notificationData, null, 2));
      
      // Simpan ke Firestore
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notification created with ID:', docRef.id);
      
      alert('Notification created successfully!');
      router.push('/notifications');

    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Komponen untuk preview link ala halaman notes
  const LinkPreviewSection = () => {
    const hasLinks = Object.values(linkPreview).some(arr => arr.length > 0);
    
    if (!hasLinks) return null;
    
    return (
      <div style={{
        marginTop: '30px',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          marginBottom: '20px',
          color: '#fff'
        }}>
          Preview Link
        </h3>
        
        {/* YouTube Links */}
        {linkPreview.youtube.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{
              fontSize: '1.2rem',
              marginBottom: '15px',
              color: '#ff0000'
            }}>
              YouTube ({linkPreview.youtube.length})
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {linkPreview.youtube.map((url, index) => {
                const thumbnail = generateThumbnail(url);
                const embedUrl = getVideoEmbedUrl(url);
                
                return (
                  <div
                    key={index}
                    style={{
                      background: '#111',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #333'
                    }}
                  >
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt="YouTube thumbnail"
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x180?text=Video';
                        }}
                      />
                    )}
                    <div style={{ padding: '15px' }}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          wordBreak: 'break-all'
                        }}
                      >
                        {url}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Image Links */}
        {linkPreview.images.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{
              fontSize: '1.2rem',
              marginBottom: '15px',
              color: '#4ecdc4'
            }}>
              Images ({linkPreview.images.length})
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {linkPreview.images.map((url, index) => (
                <div
                  key={index}
                  style={{
                    background: '#111',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #333'
                  }}
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div style={{ padding: '10px' }}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        wordBreak: 'break-all'
                      }}
                    >
                      {url.split('/').pop() || url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* PDF Links */}
        {linkPreview.pdf.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              fontSize: '1.2rem',
              marginBottom: '15px',
              color: '#ff6b6b'
            }}>
              PDF Documents ({linkPreview.pdf.length})
            </h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              {linkPreview.pdf.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px',
                    background: 'rgba(255,107,107,0.1)',
                    borderRadius: '8px',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    wordBreak: 'break-all'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span>{url.split('/').pop() || url}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Video Links */}
        {linkPreview.videos.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              fontSize: '1.2rem',
              marginBottom: '15px',
              color: '#45b7d1'
            }}>
              Videos ({linkPreview.videos.length})
            </h4>
            <div style={{ display: 'grid', gap: '15px' }}>
              {linkPreview.videos.map((url, index) => (
                <div
                  key={index}
                  style={{
                    background: '#111',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #333'
                  }}
                >
                  <video
                    controls
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      background: '#000'
                    }}
                  >
                    <source src={url} />
                  </video>
                  <div style={{ padding: '15px' }}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        wordBreak: 'break-all'
                      }}
                    >
                      {url.split('/').pop() || url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Website Links */}
        {linkPreview.websites.length > 0 && (
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              marginBottom: '15px',
              color: '#96ceb4'
            }}>
              Websites ({linkPreview.websites.length})
            </h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              {linkPreview.websites.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px',
                    background: 'rgba(150,206,180,0.1)',
                    borderRadius: '8px',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    wordBreak: 'break-all'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span>{url}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Total Links */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          fontSize: '1rem',
          color: '#888'
        }}>
          Total Links: {Object.values(linkPreview).reduce((acc, arr) => acc + arr.length, 0)}
        </div>
      </div>
    );
  };

  // SVG North East Arrow - Large
  const NorthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
    >
      <path d="M7 7L17 17" />
      <path d="M7 17V7H17" />
    </svg>
  );

  // SVG South East Arrow - Large
  const SouthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
    >
      <path d="M5 5L19 19" />
      <path d="M5 19H19V5" />
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#ffffff',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={() => router.push('/notifications')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: 0
            }}
          >
            <NorthEastArrow />
          </button>
          <span style={{ fontSize: '2.5rem' }}>Create Notification</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <span style={{ fontSize: '1.5rem', color: '#ffffff' }}>{currentDateTime}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{user?.displayName || user?.email || 'Visitor'}</span>
            <NorthEastArrow />
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Type Selection */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            'Announcement',
            'Maintenance',
            'System',
            'Update',
            'Alert',
            'Info'
          ].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleInputChange('type', label.toLowerCase())}
              style={{
                padding: '0.5rem 0',
                background: 'none',
                border: 'none',
                color: formData.type === label.toLowerCase() ? '#ffffff' : '#666666',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Title"
            required
            style={{
              width: '100%',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '2rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: '2rem' }}>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Message - Masukkan link YouTube, PDF, gambar, video, atau website"
            required
            rows={6}
            style={{
              width: '100%',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.5rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
          <div style={{ 
            marginTop: '0.5rem', 
            fontSize: '1rem', 
            color: '#888888',
            background: 'rgba(255,255,255,0.05)',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <strong>Supported Links:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
              <li>YouTube: https://youtube.com/watch?v=... atau https://youtu.be/...</li>
              <li>PDF: https://example.com/file.pdf</li>
              <li>Images: .jpg, .jpeg, .png, .gif, .webp, .svg</li>
              <li>Videos: .mp4, .webm, .ogg, .mov</li>
              <li>Websites: https://example.com</li>
            </ul>
          </div>
        </div>

        {/* Link Preview Section - SEPERTI DI HALAMAN NOTES */}
        <LinkPreviewSection />

        {/* Calendar - Dropdown Style */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#888888' }}>Schedule</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '1rem 2rem',
                background: '#111111',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              <option value="">Year</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>

            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '1rem 2rem',
                background: '#111111',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                minWidth: '140px'
              }}
            >
              <option value="">Month</option>
              {months.map(month => <option key={month} value={month}>{month}</option>)}
            </select>

            <select 
              value={selectedDay} 
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{
                padding: '1rem 2rem',
                background: '#111111',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              <option value="">Day</option>
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>

            <select 
              value={selectedHour} 
              onChange={(e) => setSelectedHour(e.target.value)}
              style={{
                padding: '1rem 2rem',
                background: '#111111',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              <option value="">Hour</option>
              {hours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
            </select>

            <select 
              value={selectedMinute} 
              onChange={(e) => setSelectedMinute(e.target.value)}
              style={{
                padding: '1rem 2rem',
                background: '#111111',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              <option value="">Minute</option>
              {minutes.map(minute => <option key={minute} value={minute}>{minute}</option>)}
            </select>
          </div>
        </div>

        {/* Recipient Type */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
          {[
            { value: 'all', label: 'All Users' },
            { value: 'specific', label: 'Specific Users' },
            { value: 'email', label: 'Email Addresses' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleInputChange('recipientType', option.value)}
              style={{
                padding: '0.5rem 0',
                background: 'none',
                border: 'none',
                color: formData.recipientType === option.value ? '#ffffff' : '#666666',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Specific Users */}
        {formData.recipientType === 'specific' && (
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Users"
              style={{
                width: '100%',
                padding: '0.5rem 0',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                marginBottom: '1rem'
              }}
            />
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {isLoadingUsers ? (
                <div style={{ padding: '0.5rem 0', color: '#888888', fontSize: '1.5rem' }}>Loading...</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding: '0.5rem 0', color: '#888888', fontSize: '1.5rem' }}>No Users Found</div>
              ) : (
                filteredUsers.map((userItem) => (
                  <div
                    key={userItem.uid}
                    onClick={() => toggleUserSelection(userItem.uid)}
                    style={{
                      padding: '0.5rem 0',
                      color: formData.recipientIds.includes(userItem.uid) ? '#ffffff' : '#888888',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {userItem.displayName || userItem.email || 'No Name'}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Email Recipients */}
        {formData.recipientType === 'email' && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="email"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
                placeholder="Email Address"
                style={{
                  flex: 1,
                  padding: '0.5rem 0',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.5rem'
                }}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipientEmail())}
              />
              <button
                type="button"
                onClick={addRecipientEmail}
                style={{
                  padding: '0.5rem 2rem',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            {formData.recipientEmails.map((email, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                fontSize: '1.5rem'
              }}>
                <span style={{ color: '#ffffff' }}>{email}</span>
                <button
                  type="button"
                  onClick={() => removeRecipientEmail(email)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888888',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action URL */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="url"
            value={formData.actionUrl}
            onChange={(e) => handleInputChange('actionUrl', e.target.value)}
            placeholder="Action Url (Optional)"
            style={{
              width: '100%',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.5rem'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '3rem',
          marginTop: '3rem'
        }}>
          <button
            type="button"
            onClick={() => router.push('/notifications')}
            style={{
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: '#888888',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: isLoading ? '#888888' : '#ffffff',
              fontSize: '1.5rem',
              cursor: isLoading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
            <SouthEastArrow />
          </button>
        </div>
      </form>
    </div>
  );
}
