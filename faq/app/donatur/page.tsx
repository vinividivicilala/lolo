'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

// Event Categories
const eventCategories = [
  { id: "panti_asuhan", name: "Panti Asuhan" },
  { id: "panti_jompo", name: "Panti Jompo" },
  { id: "yayasan", name: "Yayasan" },
  { id: "bencana_alam", name: "Bencana Alam" },
  { id: "pendidikan", name: "Pendidikan" },
  { id: "kesehatan", name: "Kesehatan" },
  { id: "masjid", name: "Masjid" },
  { id: "umum", name: "Umum" }
];

// FAQ Data
const faqData = [
  {
    question: "Apa itu platform donasi ini?",
    answer: "Platform ini adalah wadah untuk berbagi kebaikan melalui donasi. Anda dapat membuat kegiatan donasi, berdonasi, dan berbagi cerita tentang pengalaman donasi Anda."
  },
  {
    question: "Bagaimana cara melakukan donasi?",
    answer: "Untuk melakukan donasi, Anda perlu login terlebih dahulu menggunakan akun Google. Setelah login, pilih kegiatan donasi yang ingin Anda dukung, masukkan nominal donasi dan pesan dukungan, lalu klik Kirim Donasi."
  },
  {
    question: "Apakah donasi saya aman?",
    answer: "Ya, donasi Anda aman. Kami menggunakan sistem keamanan Firebase yang terenkripsi untuk melindungi semua data transaksi dan informasi pribadi Anda."
  },
  {
    question: "Bagaimana cara membuat kegiatan donasi?",
    answer: "Login ke akun Anda, klik tombol 'Buat Kegiatan', isi judul, deskripsi, target donasi, lokasi, dan tanggal berakhir, lalu klik 'Buat'. Kegiatan donasi Anda akan langsung terlihat di feed."
  },
  {
    question: "Apakah ada biaya administrasi?",
    answer: "Tidak ada biaya administrasi. 100% dari donasi Anda akan langsung masuk ke kegiatan donasi yang Anda pilih."
  },
  {
    question: "Bagaimana cara melihat leaderboard donatur?",
    answer: "Leaderboard donatur otomatis muncul di setiap kegiatan donasi. Leaderboard menampilkan 10 donatur dengan total donasi terbanyak, lengkap dengan medal emas, perak, dan perunggu untuk top 3."
  }
];

// Instagram Verified Badge Component
const InstagramVerifiedBadge = ({ size = 24 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: '6px',
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
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          marginBottom: '8px',
          zIndex: 1000,
          fontFamily: 'Helvetica, Arial, sans-serif',
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

// Arrow Icons
const NorthEastArrow = ({ size = 28, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7 L17 7 L17 17" />
    <path d="M17 7 L7 17" />
  </svg>
);

const NorthWestArrow = ({ size = 28, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 7 L7 7 L7 17" />
    <path d="M7 7 L17 17" />
  </svg>
);

const SouthWestArrow = ({ size = 56, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 17 L7 17 L7 7" />
    <path d="M7 17 L17 7" />
  </svg>
);

const ChevronDown = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const DownloadIcon = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Icons
const PlusIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const HeartIcon = ({ size = 28, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ff6b6b" : "none"} stroke="currentColor" strokeWidth="2.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const SendIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CloseIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const MoreIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="19" cy="12" r="1.5"/>
    <circle cx="5" cy="12" r="1.5"/>
  </svg>
);

const CommentIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ShareIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

const BookOpenIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const TimeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const QuestionIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
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
  category: string;
}

export default function DonationPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Scroll state for page transition
  const [showOverlay, setShowOverlay] = useState(false);
  
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [animateProgress, setAnimateProgress] = useState<string | null>(null);
  const [progressKey, setProgressKey] = useState<number>(0);
  
  // State untuk Create Event
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    targetAmount: "",
    location: "",
    endDate: "",
    category: "umum"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk Story
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedEventForStory, setSelectedEventForStory] = useState<DonationEvent | null>(null);
  const [storyContent, setStoryContent] = useState("");
  const [storyComments, setStoryComments] = useState<{[key: string]: string}>({});
  
  // State untuk animasi
  const [animateDonation, setAnimateDonation] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'feed' | 'stories'>('feed');

  // Scroll handler for overlay transition
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
      
      // Check if scrolled to bottom (within 10px)
      const atBottom = distanceToBottom <= 10;
      
      if (atBottom && !showOverlay) {
        setShowOverlay(true);
        // Lock body scroll
        document.body.style.overflow = 'hidden';
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, [showOverlay]);

  // Close overlay and scroll to top
  const closeOverlay = () => {
    setShowOverlay(false);
    document.body.style.overflow = 'auto';
    // Scroll to top of main page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // PDF Export Function
  const exportToPDF = (event: DonationEvent) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header with website title
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Menuru", 20, 25);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text("Platform Donasi Online", 20, 35);
    
    // Event Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Donasi", 20, 60);
    
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text(event.title, 20, 75);
    
    // Event Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    
    let yPos = 95;
    const lineHeight = 7;
    
    doc.text(`Kategori: ${getCategoryName(event.category)}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Lokasi: ${event.location}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Target Donasi: ${formatRupiah(event.targetAmount)}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Terkumpul: ${formatRupiah(event.currentAmount)}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Persentase: ${getPercentage(event.currentAmount, event.targetAmount)}%`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Tanggal Dibuat: ${formatDate(event.createdAt)}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Berakhir: ${formatDate(event.endDate)}`, 20, yPos);
    yPos += lineHeight;
    
    // Description
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Deskripsi Kegiatan:", 20, yPos);
    yPos += lineHeight;
    doc.setFont("helvetica", "normal");
    const descriptionLines = doc.splitTextToSize(event.description, pageWidth - 40);
    doc.text(descriptionLines, 20, yPos);
    yPos += descriptionLines.length * lineHeight + 10;
    
    // Donors Table
    if (event.donors.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Daftar Donatur", 20, yPos);
      yPos += 5;
      
      const tableData = event.donors.map(donor => [
        donor.name,
        donor.email,
        formatRupiah(donor.amount),
        donor.message.length > 50 ? donor.message.substring(0, 47) + "..." : donor.message,
        formatDate(donor.createdAt)
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [["Nama", "Email", "Jumlah", "Pesan", "Tanggal"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 50 },
          2: { cellWidth: 35 },
          3: { cellWidth: 60 },
          4: { cellWidth: 35 }
        },
        margin: { left: 20, right: 20 }
      });
      
      const finalY = (doc as any).lastAutoTable.finalY || yPos;
      yPos = finalY + 10;
    }
    
    // Leaderboard
    const leaderboard = getLeaderboard(event.donors);
    if (leaderboard.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text("Leaderboard Donatur (Top 10)", 20, yPos);
      yPos += 5;
      
      const leaderboardData = leaderboard.map((donor, index) => [
        `${index + 1}`,
        donor.name,
        formatRupiah(donor.totalAmount)
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [["Rank", "Nama", "Total Donasi"]],
        body: leaderboardData,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5, font: 'helvetica' },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 80 },
          2: { cellWidth: 60 }
        },
        margin: { left: 20, right: 20 }
      });
      
      const finalY = (doc as any).lastAutoTable.finalY || yPos;
      yPos = finalY + 10;
    }
    
    // Summary
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan", 20, yPos);
    yPos += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(`Total Donatur: ${event.donors.length} orang`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Total Terkumpul: ${formatRupiah(event.currentAmount)}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Target: ${formatRupiah(event.targetAmount)}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Persentase Tercapai: ${getPercentage(event.currentAmount, event.targetAmount)}%`, 20, yPos);
    yPos += lineHeight * 2;
    
    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Dokumen dibuat pada: ${new Date().toLocaleString('id-ID')}`, 20, footerY);
    doc.text(`Menuru - Platform Donasi Online`, pageWidth - 70, footerY);
    
    // Save PDF
    doc.save(`Laporan_Donasi_${event.title.replace(/\s/g, '_')}.pdf`);
  };

  // Format date for PDF
  const formatDate = (date: any) => {
    if (!date) return "-";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  // GSAP Animation for FAQ
  useEffect(() => {
    faqRefs.current = faqRefs.current.slice(0, faqData.length);
    answerRefs.current = answerRefs.current.slice(0, faqData.length);
  }, []);

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      // Close animation
      if (answerRefs.current[index]) {
        gsap.to(answerRefs.current[index], {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => {
            setOpenFaqIndex(null);
          }
        });
      }
    } else {
      // Close previously opened
      if (openFaqIndex !== null && answerRefs.current[openFaqIndex]) {
        gsap.to(answerRefs.current[openFaqIndex], {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
      
      // Open new one
      setOpenFaqIndex(index);
      setTimeout(() => {
        if (answerRefs.current[index]) {
          const answerElement = answerRefs.current[index];
          const fullHeight = answerElement.scrollHeight;
          gsap.set(answerElement, { height: 0, opacity: 0 });
          gsap.to(answerElement, {
            height: fullHeight,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      }, 10);
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

  // Format number dengan titik
  const formatNumberWithDots = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse number dari format titik
  const parseNumberFromDots = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
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
      return d.toLocaleDateString('id-ID');
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

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = eventCategories.find(c => c.id === categoryId);
    return category ? category.name : "Umum";
  };

  // Get sorted events by category
  const getSortedEvents = () => {
    if (selectedCategory === "all") {
      return events;
    }
    return events.filter(event => event.category === selectedCategory);
  };

  // Get leaderboard for an event
  const getLeaderboard = (donors: Donor[]) => {
    const donorMap = new Map<string, { name: string; totalAmount: number; userId: string }>();
    
    donors.forEach(donor => {
      const existing = donorMap.get(donor.userId);
      if (existing) {
        existing.totalAmount += donor.amount;
      } else {
        donorMap.set(donor.userId, {
          name: donor.name,
          totalAmount: donor.amount,
          userId: donor.userId
        });
      }
    });
    
    const leaderboard = Array.from(donorMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
    
    return leaderboard;
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
        stories: [],
        category: newEvent.category
      };
      
      const eventsRef = collection(firebaseDb, 'donationEvents');
      const docRef = await addDoc(eventsRef, {
        ...eventData,
        createdAt: Timestamp.fromDate(eventData.createdAt),
        endDate: Timestamp.fromDate(eventData.endDate)
      });
      
      setEvents([{ id: docRef.id, ...eventData }, ...events]);
      setShowCreateModal(false);
      setNewEvent({ title: "", description: "", targetAmount: "", location: "", endDate: "", category: "umum" });
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
        images: [],
        likes: [],
        comments: [],
        createdAt: new Date()
      };
      
      const eventRef = doc(firebaseDb, 'donationEvents', selectedEventForStory.id);
      await updateDoc(eventRef, {
        stories: arrayUnion(storyData)
      });
      
      setStoryContent("");
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

  // Handle Donation with Progress Animation
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
    
    // Trigger progress bar animation immediately
    setAnimateProgress(selectedEvent.id);
    setProgressKey(prev => prev + 1);
    
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
        setAnimateProgress(null);
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error donating:", error);
      alert("Gagal mengirim donasi");
      setAnimateProgress(null);
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
          stories: data.stories || [],
          category: data.category || "umum"
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

  const sortedEvents = getSortedEvents();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}>
        <div style={{ color: '#fff', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Main Page */}
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          fontFamily: 'Helvetica, Arial, sans-serif',
          color: '#fff',
          padding: isMobile ? '24px' : '48px',
          paddingTop: isMobile ? '100px' : '120px',
          paddingBottom: isMobile ? '120px' : '150px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#000',
          borderBottom: '1px solid #222',
          zIndex: 100,
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '600',
            cursor: 'pointer',
            color: '#fff',
            fontFamily: 'Helvetica, Arial, sans-serif',
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
                  border: '1px solid #333',
                  fontSize: '15px',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '10px 24px',
                  borderRadius: '40px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                <PlusIcon size={22} />
                <span>Buat Kegiatan</span>
              </button>
            )}
            
            {user ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 20px',
                borderRadius: '40px',
                border: '1px solid #333',
              }}>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=111&color=fff&size=40`} 
                  alt={user.displayName}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <span style={{ fontSize: '15px', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  {user.displayName || user.email?.split('@')[0]?.slice(0, 12)}
                </span>
                <InstagramVerifiedBadge size={18} />
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    color: '#666',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                  }}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                style={{
                  padding: '10px 28px',
                  background: 'none',
                  border: '1px solid #333',
                  borderRadius: '40px',
                  fontSize: '15px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                Login
              </button>
            )}
            
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: '#666',
              fontSize: '15px',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}>
              <NorthEastArrow size={20} color="#666" />
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
            fontSize: isMobile ? '44px' : '56px',
            fontWeight: '600',
            letterSpacing: '-0.5px',
            marginBottom: '20px',
            color: '#fff',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}>
            Berbagi Kebaikan
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            maxWidth: '550px',
            margin: '0 auto',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}>
            Buat kegiatan donasi, bagikan cerita, dan kumpulkan dukungan
          </p>
        </div>

        {/* Category Filters - No Line Box */}
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: selectedCategory === "all" ? '600' : '400',
              background: 'transparent',
              color: selectedCategory === "all" ? '#fff' : '#666',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            Semua
          </button>
          {eventCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: selectedCategory === category.id ? '600' : '400',
                background: 'transparent',
                color: selectedCategory === category.id ? '#fff' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          marginBottom: '40px',
          display: 'flex',
          gap: '16px',
          borderBottom: '1px solid #222',
          background: 'transparent',
        }}>
          <button
            onClick={() => setActiveTab('feed')}
            style={{
              padding: '14px 32px',
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              fontWeight: activeTab === 'feed' ? '600' : '400',
              color: activeTab === 'feed' ? '#fff' : '#666',
              cursor: 'pointer',
              borderBottom: activeTab === 'feed' ? '2px solid #fff' : 'none',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            style={{
              padding: '14px 32px',
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              fontWeight: activeTab === 'stories' ? '600' : '400',
              color: activeTab === 'stories' ? '#fff' : '#666',
              cursor: 'pointer',
              borderBottom: activeTab === 'stories' ? '2px solid #fff' : 'none',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            Cerita
          </button>
        </div>

        {/* Content */}
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          marginBottom: '80px',
        }}>
          {activeTab === 'feed' ? (
            <>
              {sortedEvents.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: '#666',
                  border: '1px solid #222',
                  borderRadius: '20px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}>
                  <p style={{ fontSize: '18px', marginBottom: '24px' }}>Belum ada kegiatan</p>
                  {user && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      style={{
                        background: 'none',
                        border: '1px solid #333',
                        padding: '12px 32px',
                        borderRadius: '40px',
                        fontSize: '15px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                      }}
                    >
                      Buat kegiatan pertama
                    </button>
                  )}
                </div>
              ) : (
                sortedEvents.map((event) => {
                  const isLiked = event.likes.includes(user?.uid);
                  const percentage = getPercentage(event.currentAmount, event.targetAmount);
                  const daysLeft = getDaysRemaining(event.endDate);
                  const isAnimating = animateDonation === event.id;
                  const isProgressAnimating = animateProgress === event.id;
                  const categoryName = getCategoryName(event.category);
                  const leaderboard = getLeaderboard(event.donors);
                  
                  return (
                    <div
                      key={event.id}
                      style={{
                        marginBottom: '56px',
                        borderBottom: '1px solid #222',
                        paddingBottom: '48px',
                      }}
                    >
                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img 
                            src={event.organizerPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizerName)}&background=111&color=fff&size=52`}
                            alt={event.organizerName}
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <span style={{ fontSize: '18px', fontWeight: '500', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                {event.organizerName}
                              </span>
                              <InstagramVerifiedBadge size={18} />
                            </div>
                            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                              {formatTime(event.createdAt)} • {event.location}
                            </div>
                          </div>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                          <MoreIcon size={24} />
                        </button>
                      </div>
                      
                      {/* Category */}
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '400',
                          color: '#888',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                        }}>
                          {categoryName}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h2 style={{
                        fontSize: '32px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: '#fff',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                      }}>
                        {event.title}
                      </h2>
                      
                      {/* Description */}
                      <p style={{
                        fontSize: '18px',
                        color: '#888',
                        lineHeight: '1.6',
                        marginBottom: '28px',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                      }}>
                        {event.description}
                      </p>
                      
                      {/* Progress with Animation on Donation */}
                      <div style={{ marginBottom: '28px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '16px',
                          marginBottom: '12px',
                          color: '#888',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                        }}>
                          <span>Terkumpul</span>
                          <motion.span 
                            key={`amount-${event.id}-${event.currentAmount}`}
                            initial={{ scale: 1.2, color: '#fff' }}
                            animate={{ scale: 1, color: '#fff' }}
                            transition={{ duration: 0.3 }}
                            style={{ color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}
                          >
                            {formatRupiah(event.currentAmount)}
                          </motion.span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '16px',
                          marginBottom: '12px',
                          color: '#888',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                        }}>
                          <span>Target</span>
                          <span style={{ color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>{formatRupiah(event.targetAmount)}</span>
                        </div>
                        <div style={{
                          height: '8px',
                          backgroundColor: '#222',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginTop: '16px',
                        }}>
                          <motion.div
                            key={`progress-${event.id}-${progressKey}`}
                            initial={{ width: `${getPercentage(event.currentAmount - (isProgressAnimating ? parseNumberFromDots(donationAmount) : 0), event.targetAmount)}%` }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{
                              height: '100%',
                              backgroundColor: '#fff',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '12px',
                          fontSize: '14px',
                          color: '#666',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                        }}>
                          <span>{percentage}% terkumpul</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CalendarIcon size={18} />
                            {daysLeft > 0 ? `${daysLeft} hari` : 'Selesai'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Donation Messages Section */}
                      {event.donors.length > 0 && (
                        <div style={{
                          marginBottom: '24px',
                          padding: '20px 0',
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#fff',
                            marginBottom: '20px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}>
                            Pesan Donasi
                          </h3>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                          }}>
                            {event.donors.slice(0, 5).map((donor) => (
                              <motion.div 
                                key={donor.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  justifyContent: 'space-between',
                                  marginBottom: '8px',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                      {donor.name}
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#666', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                      {formatTime(donor.createdAt)}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '15px', fontWeight: '500', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                    {formatRupiah(donor.amount)}
                                  </span>
                                </div>
                                <p style={{
                                  fontSize: '18px',
                                  color: '#aaa',
                                  margin: 0,
                                  lineHeight: '1.5',
                                  fontStyle: 'italic',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                }}>
                                  "{donor.message}"
                                </p>
                              </motion.div>
                            ))}
                            {event.donors.length > 5 && (
                              <div style={{
                                textAlign: 'center',
                                fontSize: '13px',
                                color: '#666',
                                paddingTop: '8px',
                                fontFamily: 'Helvetica, Arial, sans-serif',
                              }}>
                                +{event.donors.length - 5} pesan donasi lainnya
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Leaderboard Section */}
                      {leaderboard.length > 0 && (
                        <div style={{
                          marginBottom: '24px',
                          padding: '20px',
                          background: '#111',
                          borderRadius: '16px',
                          border: '1px solid #222',
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#fff',
                            marginBottom: '16px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}>
                            Leaderboard Donatur
                          </h3>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}>
                            {leaderboard.map((donor, index) => (
                              <div
                                key={donor.userId}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  background: index < 3 ? 'rgba(255,255,255,0.05)' : 'transparent',
                                  borderRadius: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{
                                    width: '32px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                  }}>
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
                                  </span>
                                  <span style={{ fontSize: '15px', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                    {donor.name}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '15px',
                                  fontWeight: '600',
                                  color: '#fff',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                }}>
                                  {formatRupiah(donor.totalAmount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Donation Animation */}
                      {isAnimating && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            padding: '16px',
                            background: '#111',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            fontSize: '15px',
                            color: '#fff',
                            border: '1px solid #333',
                            textAlign: 'center',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}
                        >
                          ✨ Donasi baru! Terima kasih ✨
                        </motion.div>
                      )}
                      
                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '32px',
                        padding: '16px 0',
                        borderTop: '1px solid #222',
                        borderBottom: '1px solid #222',
                      }}>
                        <button
                          onClick={() => handleLikeEvent(event.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            fontSize: '16px',
                            color: isLiked ? '#ff6b6b' : '#666',
                            cursor: 'pointer',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}
                        >
                          <HeartIcon size={26} filled={isLiked} />
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
                            fontSize: '16px',
                            color: '#666',
                            cursor: 'pointer',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}
                        >
                          <CommentIcon size={26} />
                          <span>{event.comments.length}</span>
                        </button>
                        <button
                          onClick={() => exportToPDF(event)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: '1px solid #333',
                            borderRadius: '30px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}
                        >
                          <DownloadIcon size={20} color="#fff" />
                          <span>Download PDF</span>
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
                            fontSize: '16px',
                            color: '#fff',
                            cursor: 'pointer',
                            marginLeft: 'auto',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}
                        >
                          <SendIcon size={24} />
                          <span>Donasi</span>
                          <NorthEastArrow size={20} color="#fff" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEventForStory(event);
                            setShowStoryModal(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            fontSize: '16px',
                            color: '#666',
                            cursor: 'pointer',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}
                        >
                          <BookOpenIcon size={24} />
                          <span>Cerita</span>
                        </button>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          color: '#666',
                          cursor: 'pointer',
                        }}>
                          <ShareIcon size={26} />
                        </button>
                      </div>
                      
                      {/* Recent Donors */}
                      {event.donors.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                            {event.donors.length} donatur terbaru
                          </div>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}>
                            {event.donors.slice(-5).reverse().map((donor) => (
                              <div key={donor.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                color: '#888',
                                background: '#111',
                                padding: '6px 14px',
                                borderRadius: '30px',
                                fontFamily: 'Helvetica, Arial, sans-serif',
                              }}>
                                <span>{donor.name}</span>
                                <span>•</span>
                                <span style={{ color: '#fff' }}>{formatRupiah(donor.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Comments */}
                      {event.comments.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          {event.comments.slice(0, 3).map((comment) => (
                            <div key={comment.id} style={{
                              marginBottom: '12px',
                              fontSize: '15px',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                            }}>
                              <span style={{ fontWeight: '500', color: '#fff', marginRight: '8px' }}>{comment.name}</span>
                              <span style={{ color: '#888' }}>{comment.text}</span>
                              <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
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
                          gap: '12px',
                          marginTop: '20px',
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
                              padding: '12px 18px',
                              background: '#111',
                              border: '1px solid #333',
                              borderRadius: '30px',
                              fontSize: '15px',
                              color: '#fff',
                              outline: 'none',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                            }}
                          />
                          <button
                            onClick={() => handleCommentEvent(event.id)}
                            disabled={!newComment.trim()}
                            style={{
                              padding: '10px 24px',
                              background: 'none',
                              border: '1px solid #333',
                              borderRadius: '30px',
                              fontSize: '15px',
                              cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                              color: newComment.trim() ? '#fff' : '#444',
                              fontFamily: 'Helvetica, Arial, sans-serif',
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
                  padding: '80px 20px',
                  color: '#666',
                  border: '1px solid #222',
                  borderRadius: '20px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}>
                  <BookOpenIcon size={56} stroke="#333" />
                  <p style={{ fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>Belum ada cerita</p>
                  <p style={{ fontSize: '15px', color: '#444' }}>Jadilah yang pertama berbagi cerita dari kegiatan donasi</p>
                </div>
              ) : (
                events.map((event) => (
                  event.stories && event.stories.length > 0 && (
                    <div key={event.id} style={{ marginBottom: '40px' }}>
                      <div style={{
                        marginBottom: '28px',
                        padding: '24px',
                        background: '#111',
                        borderRadius: '20px',
                        border: '1px solid #222',
                      }}>
                        <h3 style={{
                          fontSize: '22px',
                          fontWeight: '600',
                          marginBottom: '8px',
                          color: '#fff',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                        }}>
                          {event.title}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#666', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                          {event.stories.length} cerita dibagikan
                        </p>
                      </div>
                      
                      {event.stories.map((story) => {
                        const isStoryLiked = story.likes.includes(user?.uid);
                        
                        return (
                          <motion.div
                            key={story.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                              marginBottom: '32px',
                              padding: '28px',
                              background: '#0a0a0a',
                              borderRadius: '24px',
                              border: '1px solid #222',
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '16px',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <img 
                                  src={story.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.userName)}&background=111&color=fff&size=44`}
                                  alt={story.userName}
                                  style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                  }}
                                />
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                      {story.userName}
                                    </span>
                                    <InstagramVerifiedBadge size={16} />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <TimeIcon size={14} />
                                    <span style={{ fontSize: '12px', color: '#666', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                      {formatTime(story.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                                <MoreIcon size={22} />
                              </button>
                            </div>
                            
                            <div style={{
                              fontSize: '16px',
                              lineHeight: '1.6',
                              color: '#ccc',
                              marginBottom: '24px',
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                            }}>
                              {story.content}
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '28px',
                              padding: '14px 0',
                              borderTop: '1px solid #222',
                              borderBottom: '1px solid #222',
                            }}>
                              <button
                                onClick={() => handleLikeStory(event.id, story.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '14px',
                                  color: isStoryLiked ? '#ff6b6b' : '#666',
                                  cursor: 'pointer',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                }}
                              >
                                <HeartIcon size={22} filled={isStoryLiked} />
                                <span>{story.likes.length}</span>
                              </button>
                              <button
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '14px',
                                  color: '#666',
                                  cursor: 'pointer',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                                }}
                              >
                                <CommentIcon size={22} />
                                <span>{story.comments.length}</span>
                              </button>
                              <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                fontSize: '14px',
                                color: '#666',
                                cursor: 'pointer',
                                marginLeft: 'auto',
                                fontFamily: 'Helvetica, Arial, sans-serif',
                              }}>
                                <ShareIcon size={22} />
                              </button>
                            </div>
                            
                            {story.comments.length > 0 && (
                              <div style={{ marginTop: '18px' }}>
                                {story.comments.slice(0, 2).map((comment) => (
                                  <div key={comment.id} style={{
                                    marginBottom: '10px',
                                    fontSize: '14px',
                                    fontFamily: 'Helvetica, Arial, sans-serif',
                                  }}>
                                    <span style={{ fontWeight: '500', color: '#fff', marginRight: '8px' }}>{comment.name}</span>
                                    <span style={{ color: '#888' }}>{comment.text}</span>
                                    <span style={{ fontSize: '11px', color: '#666', marginLeft: '10px' }}>
                                      {formatTime(comment.createdAt)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {user && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginTop: '18px',
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
                                    padding: '10px 16px',
                                    background: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '30px',
                                    fontSize: '14px',
                                    color: '#fff',
                                    outline: 'none',
                                    fontFamily: 'Helvetica, Arial, sans-serif',
                                  }}
                                />
                                <button
                                  onClick={() => handleCommentStory(event.id, story.id)}
                                  disabled={!storyComments[story.id]?.trim()}
                                  style={{
                                    padding: '8px 20px',
                                    background: 'none',
                                    border: '1px solid #333',
                                    borderRadius: '30px',
                                    fontSize: '13px',
                                    cursor: storyComments[story.id]?.trim() ? 'pointer' : 'not-allowed',
                                    color: storyComments[story.id]?.trim() ? '#fff' : '#444',
                                    fontFamily: 'Helvetica, Arial, sans-serif',
                                  }}
                                >
                                  Kirim
                                </button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )
                ))
              )}
            </>
          )}

          {/* FAQ Section - On Main Page */}
          <div style={{
            marginTop: '80px',
            paddingTop: '40px',
            borderTop: '1px solid #222',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px',
            }}>
              <QuestionIcon size={32} />
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#fff',
                margin: 0,
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}>
                Frequently Asked Questions
              </h2>
              <NorthWestArrow size={28} color="#fff" />
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  ref={(el) => { faqRefs.current[index] = el; }}
                  style={{
                    background: '#111',
                    borderRadius: '16px',
                    border: '1px solid #222',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flex: 1,
                    }}>
                      <NorthWestArrow size={24} color="#fff" />
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#fff',
                      }}>
                        {faq.question}
                      </span>
                    </div>
                    {openFaqIndex === index ? (
                      <ChevronUp size={24} color="#fff" />
                    ) : (
                      <ChevronDown size={24} color="#fff" />
                    )}
                  </button>
                  <div
                    ref={(el) => { answerRefs.current[index] = el; }}
                    style={{
                      height: 0,
                      opacity: 0,
                      overflow: 'hidden',
                      paddingLeft: '64px',
                      paddingRight: '24px',
                    }}
                  >
                    <p style={{
                      fontSize: '16px',
                      color: '#aaa',
                      lineHeight: '1.6',
                      margin: '0',
                      paddingBottom: '20px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                    }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay that slides up from bottom */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
              backgroundColor: '#000',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={closeOverlay}
          >
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '75px' : '120px',
                  fontWeight: '400',
                  color: '#fff',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '4px',
                  marginBottom: '40px',
                }}
              >
                DONATUR
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  marginTop: '20px',
                }}
              >
                Click anywhere to close
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          padding: '24px',
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            background: '#000',
            borderRadius: '28px',
            padding: '36px',
            maxWidth: '560px',
            width: '100%',
            border: '1px solid #222',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
            }}>
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>Buat Kegiatan</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <CloseIcon size={26} />
              </button>
            </div>
            
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Judul kegiatan"
              style={{
                width: '100%',
                padding: '16px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '20px',
                color: '#fff',
                outline: 'none',
                marginBottom: '28px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            />
            
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Deskripsi kegiatan"
              rows={4}
              style={{
                width: '100%',
                padding: '16px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '18px',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                marginBottom: '28px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            />
            
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              style={{
                width: '100%',
                padding: '16px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '18px',
                color: '#fff',
                outline: 'none',
                marginBottom: '28px',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              {eventCategories.map(category => (
                <option key={category.id} value={category.id} style={{ background: '#000', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={newEvent.targetAmount}
              onChange={(e) => setNewEvent({ ...newEvent, targetAmount: formatNumberWithDots(e.target.value) })}
              placeholder="Target donasi"
              style={{
                width: '100%',
                padding: '16px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '20px',
                color: '#fff',
                outline: 'none',
                marginBottom: '28px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            />
            
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Lokasi"
              style={{
                width: '100%',
                padding: '16px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '20px',
                color: '#fff',
                outline: 'none',
                marginBottom: '28px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            />
            
            <input
              type="date"
              value={newEvent.endDate}
              onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
              style={{
                width: '100%',
                padding: '16px 0',
                border: 'none',
                borderBottom: '1px solid #222',
                background: 'transparent',
                fontSize: '18px',
                color: '#fff',
                outline: 'none',
                marginBottom: '32px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            />
            
            <button
              onClick={handleCreateEvent}
              disabled={isSubmitting || !newEvent.title || !newEvent.description}
              style={{
                width: '100%',
                padding: '16px',
                background: '#fff',
                border: 'none',
                borderRadius: '40px',
                color: '#000',
                fontSize: '18px',
                fontWeight: '500',
                cursor: isSubmitting || !newEvent.title || !newEvent.description ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !newEvent.title || !newEvent.description ? 0.5 : 1,
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              {isSubmitting ? 'Membuat...' : 'Buat Kegiatan'}
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
          padding: '24px',
        }} onClick={() => setShowStoryModal(false)}>
          <div style={{
            background: '#000',
            borderRadius: '28px',
            padding: '36px',
            maxWidth: '560px',
            width: '100%',
            border: '1px solid #222',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '26px', fontWeight: '600', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>Bagikan Cerita</h2>
              <button onClick={() => setShowStoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <CloseIcon size={24} />
              </button>
            </div>
            
            <p style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '28px',
              padding: '14px',
              background: '#111',
              borderRadius: '12px',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}>
              {selectedEventForStory.title}
            </p>
            
            <textarea
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              placeholder="Ceritakan pengalaman donasi Anda..."
              rows={6}
              style={{
                width: '100%',
                padding: '16px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '16px',
                fontSize: '16px',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                marginBottom: '28px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            />
            
            <button
              onClick={handleCreateStory}
              disabled={isSubmitting || !storyContent.trim()}
              style={{
                width: '100%',
                padding: '16px',
                background: '#fff',
                border: 'none',
                borderRadius: '40px',
                color: '#000',
                fontSize: '17px',
                fontWeight: '500',
                cursor: isSubmitting || !storyContent.trim() ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !storyContent.trim() ? 0.5 : 1,
                fontFamily: 'Helvetica, Arial, sans-serif',
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
          padding: '24px',
        }} onClick={() => setShowDonateModal(false)}>
          <div style={{
            background: '#000',
            borderRadius: '28px',
            padding: '36px',
            maxWidth: '520px',
            width: '100%',
            border: '1px solid #222',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '26px', fontWeight: '600', color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif' }}>Kirim Donasi</h2>
              <button onClick={() => setShowDonateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <CloseIcon size={24} />
              </button>
            </div>
            
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
              {selectedEvent.title}
            </p>
            
            <input
              type="text"
              value={donationAmount}
              onChange={(e) => setDonationAmount(formatNumberWithDots(e.target.value))}
              placeholder="Jumlah donasi"
              style={{
                width: '100%',
                padding: '16px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '14px',
                fontSize: '20px',
                color: '#fff',
                outline: 'none',
                marginBottom: '20px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            />
            
            <textarea
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
              placeholder="Pesan dukungan..."
              rows={4}
              style={{
                width: '100%',
                padding: '16px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '14px',
                fontSize: '15px',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                marginBottom: '32px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            />
            
            <button
              onClick={handleDonate}
              disabled={isSubmitting || !donationAmount || !donationMessage}
              style={{
                width: '100%',
                padding: '16px',
                background: '#fff',
                border: 'none',
                borderRadius: '40px',
                color: '#000',
                fontSize: '18px',
                fontWeight: '500',
                cursor: isSubmitting || !donationAmount || !donationMessage ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !donationAmount || !donationMessage ? 0.5 : 1,
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              {isSubmitting ? 'Memproses...' : 'Kirim Donasi'}
            </button>
          </div>
        </div>
      )}
      
      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            color: '#000',
            padding: '14px 28px',
            borderRadius: '40px',
            fontSize: '15px',
            zIndex: 1001,
            fontWeight: '500',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}
        >
          {successMessage}
        </motion.div>
      )}
    </>
  );
}
