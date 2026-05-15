// app/page.tsx - Bagian Calendar Submissions dengan gaya minimalis hitam putih
// Dilengkapi dengan Stacked Card Scroll Animation (GSAP + Lenis)

'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import Image from "next/image";
import Lenis from "@studio-freight/lenis";

// Firebase imports
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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
  limit,
  where,
  getDocs,
  deleteDoc
} from "firebase/firestore";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

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

// Providers untuk login
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

// Interface untuk message
interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  userEmail?: string;
  isAdmin?: boolean;
  replyTo?: {
    messageId: string;
    userName: string;
    text: string;
  };
  timestamp: Timestamp;
}

// Interface untuk Calendar Submission
interface CalendarSubmission {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName?: string;
  trustReason: string;
  meetingType: string;
  platform: string;
  selectedDate: string;
  selectedDateFormatted: string;
  selectedTime: string;
  guests: string[];
  status: 'pending' | 'confirmed' | 'completed' | 'rejected';
  adminReply?: {
    text: string;
    repliedAt: Timestamp;
    repliedBy: string;
  };
  createdAt: Timestamp;
  userId?: string;
  userEmail?: string;
}

// Email Admin
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

// SVG Components
const NorthEastArrowIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NorthWestArrowIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ClockIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const MailIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <polyline points="22 7 12 13 2 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PhoneIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CompanyIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="15" y1="4" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="4" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const MessageIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StatusIcon = ({ status }: { status: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {status === 'pending' && <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>}
    {status === 'confirmed' && <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
    {status === 'completed' && <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></>}
    {status === 'rejected' && <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>}
  </svg>
);

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showFormView, setShowFormView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [meetingType, setMeetingType] = useState<string>("Online");
  const [location, setLocation] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [hoverActive, setHoverActive] = useState(false);
  const [noteHover, setNoteHover] = useState(false);
  const [communityHover, setCommunityHover] = useState(false);
  const [calendarHover, setCalendarHover] = useState(false);
  const [blogHover, setBlogHover] = useState(false);
  const [donationHover, setDonationHover] = useState(false);

  // State untuk warna background section Features
  const [featuresBgColor, setFeaturesBgColor] = useState('#0000ff');
  const [featuresTextColor, setFeaturesTextColor] = useState('#ffffff');

  // State untuk Shadow Page
  const [showShadowPage, setShowShadowPage] = useState(false);
  const [isShadowTransitioning, setIsShadowTransitioning] = useState(false);
  const shadowPageRef = useRef<HTMLDivElement>(null);

  // State untuk Chat
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string; text: string } | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State untuk Calendar Submissions
  const [calendarSubmissions, setCalendarSubmissions] = useState<CalendarSubmission[]>([]);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<CalendarSubmission | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"pending" | "confirmed" | "completed" | "rejected">("confirmed");

  // State untuk Stacked Cards
  const [cardsContainer, setCardsContainer] = useState<HTMLDivElement | null>(null);
  const [card1Ref, setCard1Ref] = useState<HTMLDivElement | null>(null);
  const [card2Ref, setCard2Ref] = useState<HTMLDivElement | null>(null);
  const [card3Ref, setCard3Ref] = useState<HTMLDivElement | null>(null);
  const [hasCardsAnimated, setHasCardsAnimated] = useState(false);
  const cardsSectionRef = useRef<HTMLDivElement>(null);
  const cardsPinnedRef = useRef<HTMLDivElement>(null);

  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Refs untuk teks
  const mencatatTextRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const menuruTopTextRef = useRef<HTMLDivElement>(null);
  const menuruTopMainRef = useRef<HTMLDivElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const yearTextRef = useRef<HTMLDivElement>(null);
  const contactTextRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const callTextRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const bottomContentRef = useRef<HTMLDivElement>(null);
  const calendarBtnRef = useRef<HTMLButtonElement>(null);
  const studioTextRef = useRef<HTMLDivElement>(null);
  const bottomLeftTextRef = useRef<HTMLDivElement>(null);
  const studioContainerRef = useRef<HTMLDivElement>(null);

  // Section Features Refs
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const featuresSection2Ref = useRef<HTMLDivElement>(null);
  const featuresSection3Ref = useRef<HTMLDivElement>(null);
  const featuresSection4Ref = useRef<HTMLDivElement>(null);
  const featuresSection5Ref = useRef<HTMLDivElement>(null);
  const featuresTitleRef = useRef<HTMLDivElement>(null);
  const featuresLeftNumberRef = useRef<HTMLDivElement>(null);
  const featuresRightTextRef = useRef<HTMLDivElement>(null);
  const featuresOverlayRef = useRef<HTMLDivElement>(null);
  const featuresArrowRef = useRef<HTMLDivElement>(null);
  const hoverContainerRef = useRef<HTMLDivElement>(null);
  const noteTextRef = useRef<HTMLDivElement>(null);
  const updateContainerRef = useRef<HTMLDivElement>(null);
  const circleImagesRef = useRef<HTMLDivElement>(null);

  const featuresLeftNumber2Ref = useRef<HTMLDivElement>(null);
  const featuresRightText2Ref = useRef<HTMLDivElement>(null);
  const featuresOverlay2Ref = useRef<HTMLDivElement>(null);
  const featuresArrow2Ref = useRef<HTMLDivElement>(null);
  const hoverContainer2Ref = useRef<HTMLDivElement>(null);
  const updateContainer2Ref = useRef<HTMLDivElement>(null);
  const circleImages2Ref = useRef<HTMLDivElement>(null);

  const featuresLeftNumber3Ref = useRef<HTMLDivElement>(null);
  const featuresRightText3Ref = useRef<HTMLDivElement>(null);
  const featuresOverlay3Ref = useRef<HTMLDivElement>(null);
  const featuresArrow3Ref = useRef<HTMLDivElement>(null);
  const hoverContainer3Ref = useRef<HTMLDivElement>(null);
  const updateContainer3Ref = useRef<HTMLDivElement>(null);
  const circleImages3Ref = useRef<HTMLDivElement>(null);

  const featuresLeftNumber4Ref = useRef<HTMLDivElement>(null);
  const featuresRightText4Ref = useRef<HTMLDivElement>(null);
  const featuresOverlay4Ref = useRef<HTMLDivElement>(null);
  const featuresArrow4Ref = useRef<HTMLDivElement>(null);
  const hoverContainer4Ref = useRef<HTMLDivElement>(null);
  const updateContainer4Ref = useRef<HTMLDivElement>(null);
  const circleImages4Ref = useRef<HTMLDivElement>(null);

  const featuresLeftNumber5Ref = useRef<HTMLDivElement>(null);
  const featuresRightText5Ref = useRef<HTMLDivElement>(null);
  const featuresOverlay5Ref = useRef<HTMLDivElement>(null);
  const featuresArrow5Ref = useRef<HTMLDivElement>(null);
  const hoverContainer5Ref = useRef<HTMLDivElement>(null);
  const updateContainer5Ref = useRef<HTMLDivElement>(null);
  const circleImages5Ref = useRef<HTMLDivElement>(null);

  const trustedSectionRef = useRef<HTMLDivElement>(null);
  const trustedTextRef = useRef<HTMLDivElement>(null);

  const img1Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLDivElement>(null);

  const circleImg1Ref = useRef<HTMLDivElement>(null);
  const circleImg2Ref = useRef<HTMLDivElement>(null);
  const circleImg1_2Ref = useRef<HTMLDivElement>(null);
  const circleImg2_2Ref = useRef<HTMLDivElement>(null);
  const circleImg1_3Ref = useRef<HTMLDivElement>(null);
  const circleImg2_3Ref = useRef<HTMLDivElement>(null);
  const circleImg1_4Ref = useRef<HTMLDivElement>(null);
  const circleImg2_4Ref = useRef<HTMLDivElement>(null);
  const circleImg1_5Ref = useRef<HTMLDivElement>(null);
  const circleImg2_5Ref = useRef<HTMLDivElement>(null);

  const carouselItems = [
    {
      id: 1,
      image: "/images/lkhh.jpg",
      brand: "LKHH Studio",
      description: "Creative digital agency specializing in branding and web design."
    },
    {
      id: 2,
      image: "/images/ai.jpg",
      brand: "AI Creative",
      description: "Artificial intelligence solutions for modern businesses."
    },
    {
      id: 3,
      image: "/images/5.jpg",
      brand: "Farid Corp",
      description: "Technology consulting and software development."
    },
    {
      id: 4,
      image: "/images/lkhh.jpg",
      brand: "Studio Beta",
      description: "UI/UX design and product innovation."
    },
    {
      id: 5,
      image: "/images/ai.jpg",
      brand: "Gamma Labs",
      description: "Research and development in emerging technologies."
    },
    {
      id: 6,
      image: "/images/5.jpg",
      brand: "Delta Creative",
      description: "Content creation and digital marketing."
    }
  ];

  const originalTexts = {
    ig: 'Instagram',
    x: 'X',
    linkedin: 'LinkedIn'
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getDayColor = (date: Date) => {
    if (date.toDateString() === today.toDateString()) return "#c5e800";
    if (date.toDateString() === tomorrow.toDateString()) return "#ff69b4";
    return "#4a90e2";
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  // Fungsi untuk handle form confirm dan simpan ke Firebase
  const handleConfirmMeeting = async () => {
    const fullName = (document.getElementById('fullName') as HTMLInputElement)?.value;
    const emailAddress = (document.getElementById('emailAddress') as HTMLInputElement)?.value;
    const locationOption = (document.getElementById('locationOption') as HTMLSelectElement)?.value;
    const companyName = (document.getElementById('companyName') as HTMLInputElement)?.value;
    const trustReason = (document.getElementById('trustReason') as HTMLTextAreaElement)?.value;
    const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement)?.value;

    const errors: string[] = [];
    if (!fullName?.trim()) errors.push("Nama Lengkap");
    if (!emailAddress?.trim()) errors.push("Email Address");
    if (!locationOption) errors.push("Platform Meeting");
    if (!trustReason?.trim()) errors.push("Kenapa Anda percaya dengan saya?");
    if (!phoneNumber?.trim()) errors.push("Nomor WhatsApp / HP");

    if (errors.length > 0) {
      alert(`Harap isi field berikut:\n- ${errors.join('\n- ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(emailAddress)) {
      alert("Format email tidak valid!");
      return;
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert("Format nomor HP tidak valid! Minimal 10 digit.");
      return;
    }

    if (!selectedDate) {
      alert("Silakan pilih tanggal meeting terlebih dahulu!");
      return;
    }

    if (!selectedTime) {
      alert("Silakan pilih waktu meeting terlebih dahulu!");
      return;
    }

    const guestEmails: string[] = [];
    const guestItems = document.querySelectorAll('#guestList .guest-item');
    guestItems.forEach(item => {
      const email = item.getAttribute('data-email');
      if (email) guestEmails.push(email);
    });

    const submissionData = {
      fullName: fullName.trim(),
      email: emailAddress.trim(),
      phoneNumber: phoneNumber.trim(),
      companyName: companyName?.trim() || "",
      trustReason: trustReason.trim(),
      meetingType: meetingType,
      platform: locationOption,
      selectedDate: selectedDate.toISOString(),
      selectedDateFormatted: selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      selectedTime: selectedTime,
      guests: guestEmails,
      status: 'pending',
      createdAt: serverTimestamp(),
      userId: user?.uid || null,
      userEmail: user?.email || null,
      userName: user?.displayName || user?.email?.split('@')[0] || fullName.trim()
    };

    try {
      if (db) {
        const calendarRef = collection(db, "calendar_submissions");
        await addDoc(calendarRef, submissionData);

        alert(`JADWAL MEETING BERHASIL DISIMPAN!\n\nTanggal: ${submissionData.selectedDateFormatted}\nWaktu: ${selectedTime} WIB\n\nAdmin akan menghubungi Anda maksimal 1x24 jam.`);
      } else {
        alert("Database tidak tersedia. Silakan coba lagi.");
        return;
      }
    } catch (error) {
      console.error("Error saving submission:", error);
      alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
      return;
    }

    setShowCalendarModal(false);
    setShowFormView(false);
    setSelectedDate(null);
    setSelectedTime("");

    const formInputs = ['fullName', 'emailAddress', 'companyName', 'trustReason', 'phoneNumber'];
    formInputs.forEach(id => {
      const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
      if (input) input.value = '';
    });
    const locationSelect = document.getElementById('locationOption') as HTMLSelectElement;
    if (locationSelect) locationSelect.value = '';
    const guestList = document.getElementById('guestList');
    if (guestList) guestList.innerHTML = '';
  };

  // Fungsi untuk admin reply
  const handleAdminReply = async () => {
    if (!selectedSubmission || !replyText.trim() || !isAdmin) return;

    try {
      const submissionRef = doc(db, "calendar_submissions", selectedSubmission.id);
      await updateDoc(submissionRef, {
        status: replyStatus,
        adminReply: {
          text: replyText.trim(),
          repliedAt: serverTimestamp(),
          repliedBy: user?.displayName || "ADMIN"
        }
      });

      setShowReplyModal(false);
      setSelectedSubmission(null);
      setReplyText("");
      alert("Balasan telah dikirim ke user!");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Gagal mengirim balasan.");
    }
  };

  // Load calendar submissions from Firebase
  useEffect(() => {
    if (!db) return;

    const submissionsRef = collection(db, "calendar_submissions");
    const q = query(submissionsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submissions: CalendarSubmission[] = [];
      snapshot.forEach((doc) => {
        submissions.push({ id: doc.id, ...doc.data() } as CalendarSubmission);
      });
      setCalendarSubmissions(submissions);
    });

    return () => unsubscribe();
  }, []);

  // Fungsi untuk scroll ke bottom chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const isAdminUser = currentUser.email === ADMIN_EMAIL;
        setIsAdmin(isAdminUser);

        if (isAdminUser && !currentUser.displayName) {
          await updateProfile(currentUser, { displayName: "ADMIN" });
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;

    const messagesRef = collection(db, "chat_messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(200));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !db) return;

    try {
      const messagesRef = collection(db, "chat_messages");
      const messageData: any = {
        text: newMessage.trim(),
        userId: user.uid,
        userName: isAdmin ? "ADMIN" : (user.displayName || user.email?.split('@')[0] || "User"),
        userEmail: user.email,
        isAdmin: isAdmin,
        timestamp: serverTimestamp(),
      };

      if (replyTo) {
        messageData.replyTo = {
          messageId: replyTo.id,
          userName: replyTo.name,
          text: replyTo.text.substring(0, 100)
        };
      }

      await addDoc(messagesRef, messageData);
      setNewMessage("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      name: message.userName,
      text: message.text
    });
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setShowAuthModal(false);
      setAuthError("");
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleGithubLogin = async () => {
    if (!auth) return;
    try {
      const result = await signInWithPopup(auth, githubProvider);
      setUser(result.user);
      setShowAuthModal(false);
      setAuthError("");
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleEmailLogin = async () => {
    if (!auth) return;
    try {
      const result = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setUser(result.user);
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthError("");
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleEmailRegister = async () => {
    if (!auth) return;
    try {
      const result = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      if (authName.trim()) {
        await updateProfile(result.user, { displayName: authName });
      }
      setUser(result.user);
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthError("");
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setIsChatVisible(false);
      setReplyTo(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  const randomizeText = (element: HTMLElement, originalText: string, duration: number = 0.5) => {
    const originalChars = originalText.split('');
    const totalSteps = 15;
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        const randomized = originalChars.map(() => getRandomChar()).join('');
        element.textContent = randomized;
        currentStep++;
      } else {
        clearInterval(interval);
        element.textContent = originalText;
      }
    }, duration * 1000 / totalSteps);

    return interval;
  };

  const handleSocialHover = (element: HTMLElement, originalText: string) => {
    if (!element.getAttribute('data-original')) {
      element.setAttribute('data-original', originalText);
    }

    const interval = randomizeText(element, originalText, 0.6);
    element.setAttribute('data-interval', String(interval));
  };

  const handleSocialLeave = (element: HTMLElement, originalText: string) => {
    const interval = element.getAttribute('data-interval');
    if (interval) {
      clearInterval(Number(interval));
    }
    element.textContent = originalText;
  };

  const handleStudioHoverEnter = () => {
    setHoverActive(true);

    gsap.killTweensOf([img1Ref.current, img2Ref.current]);

    gsap.set(img1Ref.current, {
      x: -200,
      y: 0,
      rotation: -10,
      scale: 0.8,
      opacity: 0
    });
    gsap.to(img1Ref.current, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(0.8)",
      delay: 0
    });

    gsap.set(img2Ref.current, {
      x: 200,
      y: 0,
      rotation: 10,
      scale: 0.8,
      opacity: 0
    });
    gsap.to(img2Ref.current, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(0.8)",
      delay: 0.1
    });
  };

  const handleStudioHoverLeave = () => {
    setHoverActive(false);

    gsap.to([img1Ref.current, img2Ref.current], {
      opacity: 0,
      scale: 0.6,
      duration: 0.3,
      ease: "power2.in"
    });
  };

  const resetTextColorsToDefault = () => {
    const leftNumbers = [
      featuresLeftNumberRef.current,
      featuresLeftNumber2Ref.current,
      featuresLeftNumber3Ref.current,
      featuresLeftNumber4Ref.current,
      featuresLeftNumber5Ref.current
    ];

    const rightTexts = [
      featuresRightTextRef.current,
      featuresRightText2Ref.current,
      featuresRightText3Ref.current,
      featuresRightText4Ref.current,
      featuresRightText5Ref.current
    ];

    const arrows = [
      featuresArrowRef.current,
      featuresArrow2Ref.current,
      featuresArrow3Ref.current,
      featuresArrow4Ref.current,
      featuresArrow5Ref.current
    ];

    const updateNumbers = document.querySelectorAll('.update-number');

    const targetColor = featuresTextColor;

    leftNumbers.forEach(num => {
      if (num && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
        gsap.to(num, { color: targetColor, duration: 0.2 });
      }
    });

    rightTexts.forEach(text => {
      if (text && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
        gsap.to(text, { color: targetColor, duration: 0.2 });
      }
    });

    updateNumbers.forEach(num => {
      const element = num as HTMLElement;
      if (!noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
        gsap.to(element, { color: targetColor, duration: 0.2 });
      }
    });

    arrows.forEach(arrow => {
      if (arrow && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
        const svg = arrow.querySelector('svg');
        if (svg) {
          gsap.to(svg, { stroke: targetColor, duration: 0.2 });
        }
      }
    });
  };

  const handleNoteHoverEnter = () => {
    setNoteHover(true);

    gsap.set(featuresOverlayRef.current, { opacity: 1 });

    gsap.to(updateContainerRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(circleImagesRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresLeftNumberRef.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightTextRef.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrowRef.current) {
      gsap.to(featuresArrowRef.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1Ref.current, circleImg2Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleNoteHoverLeave = () => {
    setNoteHover(false);

    gsap.set(featuresOverlayRef.current, { opacity: 0 });

    gsap.to(updateContainerRef.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });

    gsap.to(circleImagesRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });

    const targetColor = featuresTextColor;

    gsap.to(featuresLeftNumberRef.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightTextRef.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrowRef.current) {
      gsap.to(featuresArrowRef.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1Ref.current, circleImg2Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  const handleCommunityHoverEnter = () => {
    setCommunityHover(true);

    gsap.set(featuresOverlay2Ref.current, { opacity: 1 });

    gsap.to(updateContainer2Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(circleImages2Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresLeftNumber2Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightText2Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrow2Ref.current) {
      gsap.to(featuresArrow2Ref.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow-2 svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1_2Ref.current, circleImg2_2Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleCommunityHoverLeave = () => {
    setCommunityHover(false);

    gsap.set(featuresOverlay2Ref.current, { opacity: 0 });

    gsap.to(updateContainer2Ref.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });

    gsap.to(circleImages2Ref.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });

    const targetColor = featuresTextColor;

    gsap.to(featuresLeftNumber2Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightText2Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrow2Ref.current) {
      gsap.to(featuresArrow2Ref.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow-2 svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1_2Ref.current, circleImg2_2Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  const handleCalendarHoverEnter = () => {
    setCalendarHover(true);

    gsap.set(featuresOverlay3Ref.current, { opacity: 1 });

    gsap.to(updateContainer3Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(circleImages3Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresLeftNumber3Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightText3Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrow3Ref.current) {
      gsap.to(featuresArrow3Ref.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow-3 svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1_3Ref.current, circleImg2_3Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleCalendarHoverLeave = () => {
    setCalendarHover(false);

    gsap.set(featuresOverlay3Ref.current, { opacity: 0 });

    gsap.to(updateContainer3Ref.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });

    gsap.to(circleImages3Ref.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });

    const targetColor = featuresTextColor;

    gsap.to(featuresLeftNumber3Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightText3Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrow3Ref.current) {
      gsap.to(featuresArrow3Ref.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow-3 svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1_3Ref.current, circleImg2_3Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  const handleBlogHoverEnter = () => {
    setBlogHover(true);

    gsap.set(featuresOverlay4Ref.current, { opacity: 1 });

    gsap.to(updateContainer4Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(circleImages4Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresLeftNumber4Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightText4Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrow4Ref.current) {
      gsap.to(featuresArrow4Ref.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow-4 svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1_4Ref.current, circleImg2_4Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleBlogHoverLeave = () => {
    setBlogHover(false);

    gsap.set(featuresOverlay4Ref.current, { opacity: 0 });

    gsap.to(updateContainer4Ref.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });

    gsap.to(circleImages4Ref.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });

    const targetColor = featuresTextColor;

    gsap.to(featuresLeftNumber4Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightText4Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrow4Ref.current) {
      gsap.to(featuresArrow4Ref.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow-4 svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1_4Ref.current, circleImg2_4Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  const handleDonationHoverEnter = () => {
    setDonationHover(true);

    gsap.set(featuresOverlay5Ref.current, { opacity: 1 });

    gsap.to(updateContainer5Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(circleImages5Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresLeftNumber5Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightText5Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrow5Ref.current) {
      gsap.to(featuresArrow5Ref.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow-5 svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1_5Ref.current, circleImg2_5Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleDonationHoverLeave = () => {
    setDonationHover(false);

    gsap.set(featuresOverlay5Ref.current, { opacity: 0 });

    gsap.to(updateContainer5Ref.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });

    gsap.to(circleImages5Ref.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });

    const targetColor = featuresTextColor;

    gsap.to(featuresLeftNumber5Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    gsap.to(featuresRightText5Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });

    if (featuresArrow5Ref.current) {
      gsap.to(featuresArrow5Ref.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow-5 svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }

    gsap.to([circleImg1_5Ref.current, circleImg2_5Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  useEffect(() => {
    if (isLoading) return;

    const handleShadowPageScroll = () => {
      if (!mainContentRef.current || !shadowPageRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceToBottom = documentHeight - (scrollY + windowHeight);
      const threshold = 100;

      const shouldShowShadow = distanceToBottom <= threshold;

      if (shouldShowShadow && !showShadowPage && !isShadowTransitioning) {
        setIsShadowTransitioning(true);
        setShowShadowPage(true);

        gsap.set(shadowPageRef.current, { y: "100%" });
        gsap.to(shadowPageRef.current, {
          y: "0%",
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            setIsShadowTransitioning(false);
          }
        });

        gsap.to(mainContentRef.current, {
          y: "-5vh",
          duration: 0.6,
          ease: "power2.inOut"
        });

      } else if (!shouldShowShadow && showShadowPage && !isShadowTransitioning) {
        setIsShadowTransitioning(true);

        gsap.to(mainContentRef.current, {
          y: "0%",
          duration: 0.6,
          ease: "power2.inOut"
        });

        gsap.to(shadowPageRef.current, {
          y: "100%",
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            setShowShadowPage(false);
            setIsShadowTransitioning(false);
          }
        });
      }
    };

    window.addEventListener('scroll', handleShadowPageScroll);

    return () => {
      window.removeEventListener('scroll', handleShadowPageScroll);
    };
  }, [isLoading, showShadowPage, isShadowTransitioning]);

  useEffect(() => {
    if (isLoading) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault();
      if (isScrolling) return;

      isScrolling = true;
      const scrollAmount = e.deltaY > 0 ? 400 : -400;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });

      setTimeout(() => {
        isScrolling = false;
      }, 200);
    };

    carousel.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      carousel.removeEventListener('wheel', handleWheel);
    };
  }, [isLoading]);

  useEffect(() => {
    const initSmoother = () => {
      if (typeof window !== 'undefined' && !smootherRef.current) {
        smootherRef.current = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.2,
          effects: true,
          smoothTouch: 0.5,
          normalizeScroll: true,
          ignoreMobileResize: true,
        });
      }
    };

    const timer = setTimeout(() => {
      initSmoother();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Stacked Cards Animation dengan Lenis + GSAP
  useEffect(() => {
    if (isLoading) return;

    // Inisialisasi Lenis untuk smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Stacked Cards Animation
    if (cardsPinnedRef.current && card1Ref && card2Ref && card3Ref) {
      const section = cardsSectionRef.current;
      const pinWrap = cardsPinnedRef.current;

      if (!section || !pinWrap) return;

      // Set initial positions
      gsap.set(card2Ref, { y: 0 });
      gsap.set(card3Ref, { y: 0 });

      // Create ScrollTrigger for stacked cards
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          pin: pinWrap,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

      // Card 2 moves up and stacks on Card 1
      tl.fromTo(card2Ref,
        { y: 0, scale: 0.98, opacity: 0.8 },
        {
          y: -window.innerHeight * 0.15,
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.inOut"
        },
        0
      )
      // Card 1 becomes focused
      .to(card1Ref, {
        scale: 1,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        duration: 0.5,
        ease: "power2.out"
      }, 0)
      // Card 3 moves up and stacks on Card 2
      .fromTo(card3Ref,
        { y: 0, scale: 0.96, opacity: 0.6 },
        {
          y: -window.innerHeight * 0.3,
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.inOut"
        },
        0.5
      )
      // Make Card 1 slightly scale down when Card 3 approaches
      .to(card1Ref, {
        scale: 0.98,
        duration: 0.5,
        ease: "power2.out"
      }, 0.5);

      setHasCardsAnimated(true);
    }

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars && trigger.vars.trigger === cardsSectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, [isLoading, card1Ref, card2Ref, card3Ref]);

  // Set z-index untuk stacked cards
  useEffect(() => {
    if (!hasCardsAnimated) return;

    if (card1Ref && card2Ref && card3Ref) {
      gsap.set(card1Ref, { zIndex: 3, position: 'relative' });
      gsap.set(card2Ref, { zIndex: 2, position: 'relative' });
      gsap.set(card3Ref, { zIndex: 1, position: 'relative' });
    }
  }, [hasCardsAnimated, card1Ref, card2Ref, card3Ref]);

  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      if (!featuresSectionRef.current) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      const featuresSections = [
        featuresSectionRef.current,
        featuresSection2Ref.current,
        featuresSection3Ref.current,
        featuresSection4Ref.current,
        featuresSection5Ref.current
      ].filter(Boolean);

      const trustedSection = trustedSectionRef.current;

      if (!trustedSection) return;

      const trustedTop = trustedSection.offsetTop;
      const isAboveTrusted = scrollPosition + windowHeight/2 < trustedTop;

      let isInFeatures = false;
      featuresSections.forEach(section => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          if (scrollPosition + windowHeight/2 >= sectionTop && scrollPosition + windowHeight/2 <= sectionBottom) {
            isInFeatures = true;
          }
        }
      });

      if (isInFeatures && isAboveTrusted) {
        if (featuresBgColor !== '#0000ff') {
          setFeaturesBgColor('#0000ff');
          setFeaturesTextColor('#ffffff');
          updateFeaturesColors('#0000ff', '#ffffff');
        }
      } else if (!isAboveTrusted || !isInFeatures) {
        if (featuresBgColor !== '#ffffff') {
          setFeaturesBgColor('#ffffff');
          setFeaturesTextColor('#000000');
          updateFeaturesColors('#ffffff', '#000000');
        }
      }
    };

    const updateFeaturesColors = (bgColor: string, textColor: string) => {
      const featuresSections = [
        featuresSectionRef.current,
        featuresSection2Ref.current,
        featuresSection3Ref.current,
        featuresSection4Ref.current,
        featuresSection5Ref.current
      ].filter(Boolean);

      featuresSections.forEach(section => {
        if (section) {
          gsap.to(section, {
            backgroundColor: bgColor,
            duration: 0.3,
            ease: "power2.inOut"
          });
        }
      });

      if (featuresTitleRef.current) {
        gsap.to(featuresTitleRef.current, {
          color: textColor,
          duration: 0.3,
          ease: "power2.inOut"
        });
      }

      const leftNumbers = [
        featuresLeftNumberRef.current,
        featuresLeftNumber2Ref.current,
        featuresLeftNumber3Ref.current,
        featuresLeftNumber4Ref.current,
        featuresLeftNumber5Ref.current
      ];

      const rightTexts = [
        featuresRightTextRef.current,
        featuresRightText2Ref.current,
        featuresRightText3Ref.current,
        featuresRightText4Ref.current,
        featuresRightText5Ref.current
      ];

      const arrows = [
        featuresArrowRef.current,
        featuresArrow2Ref.current,
        featuresArrow3Ref.current,
        featuresArrow4Ref.current,
        featuresArrow5Ref.current
      ];

      const updateNumbers = document.querySelectorAll('.update-number');

      leftNumbers.forEach(num => {
        if (num && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
          gsap.to(num, { color: textColor, duration: 0.2 });
        }
      });

      rightTexts.forEach(text => {
        if (text && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
          gsap.to(text, { color: textColor, duration: 0.2 });
        }
      });

      updateNumbers.forEach(num => {
        const element = num as HTMLElement;
        if (!noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
          gsap.to(element, { color: textColor, duration: 0.2 });
        }
      });

      arrows.forEach(arrow => {
        if (arrow && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
          const svg = arrow.querySelector('svg');
          if (svg) {
            gsap.to(svg, { stroke: textColor, duration: 0.2 });
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, featuresBgColor, noteHover, communityHover, calendarHover, blogHover, donationHover]);

  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      if (!trustedSectionRef.current) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionTop = trustedSectionRef.current.offsetTop;
      const sectionBottom = sectionTop + trustedSectionRef.current.offsetHeight;

      const isInSection = scrollPosition + windowHeight/2 >= sectionTop && scrollPosition + windowHeight/2 <= sectionBottom;

      if (isInSection) {
        gsap.to(trustedSectionRef.current, {
          backgroundColor: '#000000',
          duration: 0.3,
          ease: "power2.inOut"
        });
        if (trustedTextRef.current) {
          gsap.to(trustedTextRef.current, {
            color: '#ffffff',
            duration: 0.3,
            ease: "power2.inOut"
          });
        }
        gsap.to('.carousel-brand, .carousel-desc', {
          color: '#ffffff',
          duration: 0.3,
          ease: "power2.inOut"
        });
      } else {
        gsap.to(trustedSectionRef.current, {
          backgroundColor: '#ffffff',
          duration: 0.3,
          ease: "power2.inOut"
        });
        if (trustedTextRef.current) {
          gsap.to(trustedTextRef.current, {
            color: 'rgb(21, 22, 26)',
            duration: 0.3,
            ease: "power2.inOut"
          });
        }
        gsap.to('.carousel-brand, .carousel-desc', {
          color: 'rgb(21, 22, 26)',
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const titleElement = featuresTitleRef.current;

    if (titleElement) {
      const split = new SplitText(titleElement, {
        type: "chars, words",
        charsClass: "features-char"
      });
      gsap.set(split.chars, {
        opacity: 0,
        y: 100,
        rotationX: -90,
        transformPerspective: 800,
        filter: 'blur(20px)'
      });
      ScrollTrigger.create({
        trigger: featuresSectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          gsap.to(split.chars, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            stagger: { each: 0.06, from: "start", ease: "power2.out" },
            ease: "back.out(0.6)"
          });
        },
        onLeaveBack: () => {
          gsap.to(split.chars, {
            opacity: 0,
            y: 100,
            rotationX: -90,
            filter: 'blur(20px)',
            duration: 0.8,
            stagger: { each: 0.02, from: "start" },
          });
        },
        toggleActions: "play none none reverse"
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const trustedElement = trustedTextRef.current;
    if (!trustedElement) return;

    const splitTrusted = new SplitText(trustedElement, {
      type: "chars, words",
      charsClass: "trusted-char"
    });

    gsap.set(splitTrusted.chars, {
      opacity: 0,
      y: 100,
      rotationX: -90,
      transformPerspective: 800,
      filter: 'blur(20px)'
    });

    ScrollTrigger.create({
      trigger: trustedSectionRef.current,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        gsap.to(splitTrusted.chars, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: { each: 0.03, from: "start", ease: "power2.out" },
          ease: "back.out(0.6)"
        });
      },
      onLeaveBack: () => {
        gsap.to(splitTrusted.chars, {
          opacity: 0,
          y: 100,
          rotationX: -90,
          filter: 'blur(20px)',
          duration: 0.8,
          stagger: { each: 0.02, from: "start" },
        });
      },
      toggleActions: "play none none reverse"
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading || !loadingOverlayRef.current) return;

    const splitMenuruLoading = new SplitText(menuruTopTextRef.current, {
      type: "chars, words",
      charsClass: "split-char-loading"
    });

    const splitBrand = new SplitText(brandTextRef.current, {
      type: "chars, words",
      charsClass: "split-char-loading"
    });

    const splitYear = new SplitText(yearTextRef.current, {
      type: "chars",
      charsClass: "split-char-loading"
    });

    if (splitMenuruLoading.chars) {
      gsap.set(splitMenuruLoading.chars, {
        opacity: 0,
        y: 120,
        rotationX: -120,
        rotationY: 45,
        transformPerspective: 1200,
        filter: 'blur(25px)',
        transformOrigin: '50% 50% -80px'
      });
    }

    if (splitBrand.chars) {
      gsap.set(splitBrand.chars, {
        opacity: 0,
        x: 100,
        rotationY: 90,
        transformPerspective: 1200,
        filter: 'blur(20px)',
        transformOrigin: '50% 50% -50px'
      });
    }

    if (splitYear.chars) {
      gsap.set(splitYear.chars, {
        opacity: 0,
        y: 80,
        rotationX: -60,
        transformPerspective: 1000,
        filter: 'blur(15px)',
        transformOrigin: '50% 50% -30px'
      });
    }

    const loadingTimeline = gsap.timeline({
      onComplete: () => {
        gsap.to(loadingOverlayRef.current, {
          x: '-100%',
          duration: 1,
          ease: "power3.inOut",
          onComplete: () => {
            setIsLoading(false);
            gsap.fromTo(mainContentRef.current,
              { x: '100%', opacity: 0.5 },
              { x: '0%', opacity: 1, duration: 1, ease: "power3.inOut" }
            );
            animateMenuruMain();
            animateStudioText();
            animateBottomContent();
          }
        });
      }
    });

    if (splitMenuruLoading.chars) {
      loadingTimeline.to(splitMenuruLoading.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: { each: 0.05, from: "start", ease: "back.out(1.2)" },
        ease: "back.out(0.8)"
      }, 0);
    }

    if (splitBrand.chars) {
      loadingTimeline.to(splitBrand.chars, {
        opacity: 1,
        x: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1,
        stagger: { each: 0.04, from: "end", ease: "power2.out" },
        ease: "back.out(1)"
      }, 0.2);
    }

    if (splitYear.chars) {
      loadingTimeline.to(splitYear.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: { each: 0.08, from: "start", ease: "bounce.out" },
        ease: "back.out(1.1)"
      }, 0.4);
    }

    return () => {
      loadingTimeline.kill();
    };
  }, [isLoading]);

  const animateMenuruMain = () => {
    if (menuruTopMainRef.current) {
      gsap.set(menuruTopMainRef.current, { x: -500, opacity: 0 });
      gsap.to(menuruTopMainRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.1
      });
    }
  };

  const animateStudioText = () => {
    if (studioTextRef.current) {
      gsap.set(studioTextRef.current, { opacity: 0, y: 50 });
      gsap.to(studioTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3
      });
    }

    if (bottomLeftTextRef.current) {
      gsap.set(bottomLeftTextRef.current, { opacity: 0, y: 50 });
      gsap.to(bottomLeftTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.45
      });
    }
  };

  const animateBottomContent = () => {
    if (bottomContentRef.current) {
      gsap.fromTo(bottomContentRef.current,
        { opacity: 0, y: 50, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: "power3.out",
          delay: 0.5
        }
      );
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (emailRef.current) {
      const splitEmail = new SplitText(emailRef.current, {
        type: "chars",
        charsClass: "split-char"
      });

      gsap.fromTo(splitEmail.chars,
        { opacity: 0, x: -30, filter: 'blur(5px)' },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.02,
          ease: "power2.out",
          scrollTrigger: {
            trigger: emailRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    if (menuruTextRef.current) {
      const splitMenuru = new SplitText(menuruTextRef.current, {
        type: "chars",
        charsClass: "split-char-menuru"
      });

      gsap.set(splitMenuru.chars, {
        opacity: 0,
        y: 200,
        rotationY: 90,
        transformPerspective: 800,
        filter: 'blur(20px)'
      });

      gsap.to(splitMenuru.chars, {
        opacity: 1,
        y: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1.5,
        stagger: { each: 0.04, from: "start", ease: "power2.out" },
        ease: "back.out(0.8)",
        scrollTrigger: {
          trigger: menuruTextRef.current,
          start: "top 85%",
          end: "bottom 65%",
          toggleActions: "play none none reverse",
        }
      });
    }

    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { width: '0%', opacity: 0, x: 100 },
        {
          width: '100%',
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoading]);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCalendarModal(false);
        setShowFormView(false);
      }
    };

    if (showCalendarModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendarModal]);

  useEffect(() => {
    if (showCalendarModal && showFormView) {
      setTimeout(() => {
        const addGuestBtn = document.getElementById('addGuestBtn');
        if (addGuestBtn) {
          addGuestBtn.onclick = () => {
            const guestEmail = (document.getElementById('guestEmail') as HTMLInputElement)?.value;
            if (!guestEmail) {
              alert("Masukkan email guest terlebih dahulu!");
              return;
            }

            const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
            if (!emailRegex.test(guestEmail)) {
              alert("Format email guest tidak valid!");
              return;
            }

            const guestList = document.getElementById('guestList');
            if (guestList && guestList.children.length >= 3) {
              alert("Maksimal 3 guest!");
              return;
            }

            const guestItem = document.createElement('div');
            guestItem.className = 'guest-item';
            guestItem.setAttribute('data-email', guestEmail);
            guestItem.style.cssText = 'display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background-color: #f0f0f0; border-radius: 60px; font-size: 12px;';
            guestItem.innerHTML = `
              <span>${guestEmail}</span>
              <button class="remove-guest" style="background: none; border: none; cursor: pointer; color: #ff4444; font-size: 16px;">×</button>
            `;

            guestItem.querySelector('.remove-guest')?.addEventListener('click', () => {
              guestItem.remove();
            });

            guestList.appendChild(guestItem);
            (document.getElementById('guestEmail') as HTMLInputElement).value = '';
          };
        }
      }, 100);
    }
  }, [showCalendarModal, showFormView]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowPopup(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowPopup(false);
  };

  const handleContact = () => {};

  const handleEmailClick = () => {
    window.location.href = 'mailto:contact.menuru@gmail.com';
  };

  const handleSocialClick = (platform: string) => {};

  const handleCalendarCall = () => {
    setShowCalendarModal(true);
    setShowFormView(false);
    setSelectedDate(null);
    setSelectedTime("");
  };

  const ArrowIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const StraightLine = ({ size = 50 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
  };

  const getDateParts = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase(),
      year: date.getFullYear()
    };
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');

        @font-face {
          font-family: 'Aeonik-Regular';
          src: url('/fonts/Aeonik-Regular.woff2') format('woff2'),
               url('/fonts/Aeonik-Regular.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        *::-webkit-scrollbar {
          display: none;
        }

        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: white;
        }

        #smooth-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        #smooth-content {
          min-height: 100vh;
          width: 100%;
          will-change: transform;
        }

        .split-char {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .split-char-menuru {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .split-char-loading {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .trusted-char {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .features-char {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .split-line {
          display: block;
          overflow: hidden;
          will-change: transform, opacity, filter;
        }

        .contact-btn-effect {
          position: relative;
          isolation: isolate;
          transition: all 0.3s ease;
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 1.5px solid #cccccc !important;
        }

        .contact-btn-effect::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0%;
          background-color: #000000;
          transition: height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          z-index: -1;
          border-radius: 60px;
        }

        .contact-btn-effect:hover::before {
          height: 100%;
        }

        .contact-btn-effect:hover {
          color: #ffffff !important;
          border-color: #333333 !important;
        }

        .contact-btn-effect .dot-small {
          background-color: #000000 !important;
        }

        .contact-btn-effect:hover .dot-small {
          opacity: 0 !important;
          transform: scale(0) !important;
        }

        .circle-large-white {
          background-color: #000000 !important;
        }

        .circle-large-white svg path {
          stroke: #ffffff !important;
        }

        .contact-btn-effect:hover .circle-large-white {
          background-color: #ffffff !important;
          opacity: 1 !important;
          transform: scale(1) !important;
        }

        .contact-btn-effect:hover .circle-large-white svg path {
          stroke: #000000 !important;
        }

        .dot-small {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .circle-large-white {
          transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
        }

        .social-item {
          transition: all 0.3s ease;
        }

        .cookie-link {
          transition: opacity 0.3s ease;
        }

        .cookie-link:hover {
          opacity: 0.7;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes shadowFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
          display: block;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        .call-farid-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 60px;
          line-height: 66px;
          color: rgb(16, 16, 16);
          text-align: left;
        }

        .email-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 32px;
          color: rgb(16, 16, 16);
          letter-spacing: 0.02em;
        }

        .badge-founder {
          display: inline-flex;
          align-items: center;
          padding: 10px 28px;
          background-color: #000000;
          border-radius: 60px;
          font-family: 'Questrial', sans-serif;
          font-size: 30px;
          font-weight: 500;
          color: #ffffff;
          border: 1px solid #333333;
        }

        .calendar-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background-color: #c5e800;
          border: none;
          border-radius: 60px;
          cursor: pointer;
          font-family: 'Questrial', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #000000;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .calendar-btn:hover {
          background-color: #b0d100;
          transform: scale(1.02);
        }

        .email-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }

        .email-wrapper:hover {
          opacity: 0.7;
        }

        .calendar-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.3s ease;
        }

        .calendar-modal {
          background-color: #ffffff;
          border-radius: 32px;
          width: 90%;
          max-width: 1400px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalFadeIn 0.3s ease;
        }

        .calendar-day {
          transition: all 0.2s ease;
          cursor: pointer;
          border-radius: 12px;
        }

        .calendar-day:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .time-slot {
          transition: all 0.2s ease;
          cursor: pointer;
          border-radius: 8px;
        }

        .time-slot:hover {
          transform: scale(1.02);
          background-color: #f0f0f0 !important;
        }

        .selected-date {
          box-shadow: 0 0 0 3px #000000;
        }

        .studio-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 80px;
          color: rgb(16, 16, 16);
          letter-spacing: -0.02em;
          line-height: 1.2;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }

        .studio-text:hover {
          opacity: 0.8;
        }

        .studio-hover-images {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 150;
        }

        .floating-img-studio {
          position: absolute;
          width: 400px;
          height: 500px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          opacity: 0;
          background-color: #f5f5f5;
        }

        .bottom-left-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 40px;
          color: rgb(16, 16, 16);
          letter-spacing: -0.02em;
          line-height: 1.3;
        }

        .features-section {
          min-height: 25vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: background-color 0.3s ease;
          position: relative;
          z-index: 5;
          padding: 40px 80px 40px 80px;
          box-sizing: border-box;
          overflow: visible;
          border-bottom: 1px solid rgba(255,255,255,0.15);
        }

        .features-top {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          margin-bottom: 30px;
        }

        .features-title {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          font-size: 300px;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
          transition: color 0.3s ease;
        }

        .features-bottom {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
          z-index: 10;
        }

        .features-left-number {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          font-size: 150px;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
          transition: color 0.2s ease;
        }

        .hover-container {
          position: relative;
          cursor: pointer;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .features-right-text {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          font-size: 150px;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
          transition: color 0.2s ease;
          display: inline-block;
          z-index: 2;
          position: relative;
        }

        .update-container {
          opacity: 0;
          transform: translateX(50px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          position: relative;
        }

        .update-number {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-size: 70px;
          font-weight: 400;
          line-height: 1;
          transition: color 0.2s ease;
        }

        .update-number sup {
          font-size: 35px;
        }

        .features-right-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          z-index: 2;
          position: relative;
        }

        .features-right-arrow svg {
          width: 50px;
          height: 50px;
          stroke: currentColor;
          transition: stroke 0.2s ease, transform 0.2s ease;
        }

        .circle-images-container {
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 10px;
          z-index: 2;
          position: relative;
        }

        .circle-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          transition: transform 0.2s ease;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .features-overlay {
          position: absolute;
          top: -20px;
          left: -100vw;
          right: -200px;
          bottom: -20px;
          background-color: #000000;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          border-radius: 0px;
          transition: opacity 0.2s ease;
          width: calc(100% + 100vw + 200px);
        }

        .hover-container:hover .features-overlay {
          opacity: 1;
        }

        .hover-container:hover .update-container {
          opacity: 1;
          transform: translateX(0);
        }

        .hover-container:hover .circle-images-container {
          opacity: 1;
          transform: translateX(0);
        }

        .trusted-section {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          transition: background-color 0.3s ease;
          position: relative;
          z-index: 5;
          padding-left: 80px;
          padding-top: 80px;
          padding-bottom: 80px;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .trusted-text {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          font-size: 150px;
          color: rgb(21, 22, 26);
          letter-spacing: -0.02em;
          line-height: 1.2;
          text-align: left;
          margin: 0;
          transition: color 0.3s ease;
          margin-bottom: 60px;
        }

        .carousel-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          cursor: grab;
          scroll-behavior: smooth;
          padding-bottom: 40px;
        }

        .carousel-container:active {
          cursor: grabbing;
        }

        .carousel-track {
          display: flex;
          gap: 30px;
          padding-right: 80px;
        }

        .carousel-item {
          flex-shrink: 0;
          width: 380px;
          background: transparent;
          border-radius: 24px;
          transition: all 0.3s ease;
        }

        .carousel-item:hover {
          transform: translateY(-10px);
        }

        .carousel-image {
          width: 100%;
          height: 380px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          margin-bottom: 20px;
        }

        .carousel-brand {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 500;
          font-size: 24px;
          color: rgb(21, 22, 26);
          margin: 0 0 8px 0;
          transition: color 0.3s ease;
          letter-spacing: -0.02em;
        }

        .carousel-desc {
          font-family: 'Questrial', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: rgb(21, 22, 26);
          line-height: 1.5;
          transition: color 0.3s ease;
          opacity: 0.8;
        }

        .carousel-container::-webkit-scrollbar {
          height: 4px;
          display: block;
        }

        .carousel-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .carousel-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }

        .trusted-section .carousel-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.2);
        }

        .trusted-section .carousel-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Style untuk Calendar Submissions Section - Minimalis Hitam Putih */
        .calendar-submissions-section {
          width: 100%;
          padding: 80px 80px;
          background-color: #ffffff;
          border-top: 1px solid #e0e0e0;
          box-sizing: border-box;
        }

        .submission-item {
          border-bottom: 1px solid #e0e0e0;
          padding: 48px 0;
        }

        .submission-item:last-child {
          border-bottom: none;
        }

        .reply-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          z-index: 20001;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reply-modal {
          background-color: #ffffff;
          border-radius: 32px;
          width: 90%;
          max-width: 600px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }

        /* Font Aeonik untuk semua teks */
        .aeonik-text {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          color: #000000;
        }

        /* Stacked Cards Animation Styles */
        .stacked-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stacked-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.3);
        }

        /* Smooth scroll behavior for Lenis */
        html.lenis {
          height: auto;
        }

        .lenis.lenis-smooth {
          scroll-behavior: auto;
        }

        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }

        .lenis.lenis-stopped {
          overflow: hidden;
        }
      `}</style>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div
          ref={loadingOverlayRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '40px',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            <span ref={menuruTopTextRef}>MENURU</span>
          </div>

          <div style={{
            position: 'absolute',
            top: '50%',
            right: '60px',
            transform: 'translateY(-50%)',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            textAlign: 'right',
          }}>
            <span ref={brandTextRef}>BRAND</span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>
            <span ref={yearTextRef}>2026</span>
          </div>
        </div>
      )}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div
            ref={mainContentRef}
            style={{
              minHeight: '100vh',
              backgroundColor: 'white',
              margin: 0,
              padding: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Questrial, sans-serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              position: 'relative',
              opacity: isLoading ? 0 : 1,
              transform: isLoading ? 'translateX(100%)' : 'translateX(0)',
              transition: 'all 0.01s ease'
            }}
          >
            {/* HEADER SECTION - MENURU */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              pointerEvents: 'none',
              padding: '20px 0 0 40px'
            }}>
              <div
                ref={menuruTopMainRef}
                style={{
                  fontFamily: 'Inter, "Helvetica Neue", sans-serif',
                  fontWeight: '400',
                  fontSize: '213px',
                  lineHeight: '213px',
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  transform: 'translateX(-500px)'
                }}
              >
                MENURU
              </div>
            </div>

            {/* SECTION 1 - MENURU.STUDIO */}
            <div
              ref={studioContainerRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: '100vh',
                paddingRight: '80px',
                position: 'relative',
              }}
            >
              <div
                ref={studioTextRef}
                className="studio-text"
                style={{
                  textAlign: 'right',
                  opacity: 0
                }}
                onMouseEnter={handleStudioHoverEnter}
                onMouseLeave={handleStudioHoverLeave}
              >
                <div>MENURU.STUDIO – Jakarta UX/UI Design</div>
                <div>Personal for Note, Donation & Calendar</div>
              </div>

              <div
                ref={bottomLeftTextRef}
                className="bottom-left-text"
                style={{
                  position: 'absolute',
                  bottom: '5%',
                  left: '80px',
                  textAlign: 'left',
                  opacity: 0,
                }}
              >
                IDN
                <br />
                MN'RU© - 26'
              </div>

              <div className="studio-hover-images">
                <div
                  ref={img1Ref}
                  className="floating-img-studio"
                  style={{
                    left: '0%',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <Image
                    src="/images/lkhh.jpg"
                    alt="Gallery 1"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div
                  ref={img2Ref}
                  className="floating-img-studio"
                  style={{
                    right: '0%',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <Image
                    src="/images/ai.jpg"
                    alt="Gallery 2"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION FEATURES */}
            <div
              ref={featuresSectionRef}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-top">
                <div
                  ref={featuresTitleRef}
                  className="features-title"
                  style={{ color: featuresTextColor }}
                >
                  Features
                </div>
              </div>
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumberRef}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  01
                </div>

                <div
                  ref={hoverContainerRef}
                  className="hover-container"
                  onMouseEnter={handleNoteHoverEnter}
                  onMouseLeave={handleNoteHoverLeave}
                >
                  <div
                    ref={featuresRightTextRef}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Note
                  </div>

                  <div ref={updateContainerRef} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Update<sup>¹</sup>
                    </div>
                  </div>

                  <div
                    ref={featuresArrowRef}
                    className="features-right-arrow"
                  >
                    {noteHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrowIcon size={50} />
                    )}
                  </div>

                  <div ref={circleImagesRef} className="circle-images-container">
                    <div
                      ref={circleImg1Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/lkhh.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/ai.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  <div ref={featuresOverlayRef} className="features-overlay" />
                </div>
              </div>
            </div>

            <div
              ref={featuresSection2Ref}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumber2Ref}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  02
                </div>

                <div
                  ref={hoverContainer2Ref}
                  className="hover-container"
                  onMouseEnter={handleCommunityHoverEnter}
                  onMouseLeave={handleCommunityHoverLeave}
                >
                  <div
                    ref={featuresRightText2Ref}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Community
                  </div>

                  <div ref={updateContainer2Ref} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Join<sup>²</sup>
                    </div>
                  </div>

                  <div
                    ref={featuresArrow2Ref}
                    className="features-right-arrow"
                  >
                    {communityHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrowIcon size={50} />
                    )}
                  </div>

                  <div ref={circleImages2Ref} className="circle-images-container">
                    <div
                      ref={circleImg1_2Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/ai.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2_2Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/lkhh.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  <div ref={featuresOverlay2Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            <div
              ref={featuresSection3Ref}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumber3Ref}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  03
                </div>

                <div
                  ref={hoverContainer3Ref}
                  className="hover-container"
                  onMouseEnter={handleCalendarHoverEnter}
                  onMouseLeave={handleCalendarHoverLeave}
                >
                  <div
                    ref={featuresRightText3Ref}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Calendar
                  </div>

                  <div ref={updateContainer3Ref} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Schedule<sup>³</sup>
                    </div>
                  </div>

                  <div
                    ref={featuresArrow3Ref}
                    className="features-right-arrow"
                  >
                    {calendarHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrowIcon size={50} />
                    )}
                  </div>

                  <div ref={circleImages3Ref} className="circle-images-container">
                    <div
                      ref={circleImg1_3Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/5.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2_3Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/lkhh.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  <div ref={featuresOverlay3Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            <div
              ref={featuresSection4Ref}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumber4Ref}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  04
                </div>

                <div
                  ref={hoverContainer4Ref}
                  className="hover-container"
                  onMouseEnter={handleBlogHoverEnter}
                  onMouseLeave={handleBlogHoverLeave}
                >
                  <div
                    ref={featuresRightText4Ref}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Blog
                  </div>

                  <div ref={updateContainer4Ref} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Read<sup>⁴</sup>
                    </div>
                  </div>

                  <div
                    ref={featuresArrow4Ref}
                    className="features-right-arrow"
                  >
                    {blogHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrowIcon size={50} />
                    )}
                  </div>

                  <div ref={circleImages4Ref} className="circle-images-container">
                    <div
                      ref={circleImg1_4Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/ai.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2_4Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/5.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  <div ref={featuresOverlay4Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            <div
              ref={featuresSection5Ref}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumber5Ref}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  05
                </div>

                <div
                  ref={hoverContainer5Ref}
                  className="hover-container"
                  onMouseEnter={handleDonationHoverEnter}
                  onMouseLeave={handleDonationHoverLeave}
                >
                  <div
                    ref={featuresRightText5Ref}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Donation
                  </div>

                  <div ref={updateContainer5Ref} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Support<sup>⁵</sup>
                    </div>
                  </div>

                  <div
                    ref={featuresArrow5Ref}
                    className="features-right-arrow"
                  >
                    {donationHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrowIcon size={50} />
                    )}
                  </div>

                  <div ref={circleImages5Ref} className="circle-images-container">
                    <div
                      ref={circleImg1_5Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/lkhh.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2_5Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/ai.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  <div ref={featuresOverlay5Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            {/* STACKED CARDS SECTION */}
            {!isLoading && (
              <div
                ref={cardsSectionRef}
                style={{
                  width: '100%',
                  minHeight: '200vh',
                  position: 'relative',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <div
                  ref={cardsPinnedRef}
                  style={{
                    width: '100%',
                    height: '100vh',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '1200px',
                    height: '80vh',
                    margin: '0 auto',
                  }}>

                    {/* CARD 1 - Default / Fokus Utama */}
                    <div
                      ref={(el) => setCard1Ref(el)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ffffff',
                        borderRadius: '32px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{
                        height: '40%',
                        backgroundColor: '#000000',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <Image
                          src="/images/lkhh.jpg"
                          alt="Card 1 Background"
                          fill
                          style={{ objectFit: 'cover', opacity: 0.8 }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '30px',
                          left: '40px',
                          color: '#ffffff',
                          fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        }}>
                          <div style={{ fontSize: '14px', letterSpacing: '2px', marginBottom: '8px' }}>FEATURED</div>
                          <div style={{ fontSize: '48px', fontWeight: '400', letterSpacing: '-0.02em' }}>Creative Direction</div>
                        </div>
                      </div>
                      <div style={{
                        padding: '48px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <h2 style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '32px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '16px',
                            letterSpacing: '-0.02em',
                          }}>
                            MENURU STUDIO
                          </h2>
                          <p style={{
                            fontFamily: "'Questrial', sans-serif",
                            fontSize: '18px',
                            color: '#666666',
                            lineHeight: '1.6',
                            marginBottom: '24px',
                          }}>
                            Jakarta-based UX/UI design studio focusing on digital products,
                            branding, and creative technology solutions.
                          </p>
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap',
                          }}>
                            <span style={{
                              padding: '6px 16px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '60px',
                              fontSize: '14px',
                              fontFamily: "'Questrial', sans-serif",
                            }}>UX Research</span>
                            <span style={{
                              padding: '6px 16px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '60px',
                              fontSize: '14px',
                              fontFamily: "'Questrial', sans-serif",
                            }}>UI Design</span>
                            <span style={{
                              padding: '6px 16px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '60px',
                              fontSize: '14px',
                              fontFamily: "'Questrial', sans-serif",
                            }}>Prototyping</span>
                          </div>
                        </div>
                        <div style={{
                          marginTop: '32px',
                          paddingTop: '24px',
                          borderTop: '1px solid #e0e0e0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '14px',
                            color: '#999999',
                            letterSpacing: '1px',
                          }}>01 / 03</span>
                          <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '16px',
                            fontWeight: '400',
                            color: '#000000',
                          }}>
                            <span>VIEW PROJECT</span>
                            <NorthEastArrowIcon size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CARD 2 - Berada di bawah Card 1 */}
                    <div
                      ref={(el) => setCard2Ref(el)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) translateY(5%)',
                        width: '95%',
                        height: '95%',
                        backgroundColor: '#ffffff',
                        borderRadius: '28px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        willChange: 'transform',
                      }}
                    >
                      <div style={{
                        height: '35%',
                        backgroundColor: '#1a1a1a',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <Image
                          src="/images/ai.jpg"
                          alt="Card 2 Background"
                          fill
                          style={{ objectFit: 'cover', opacity: 0.7 }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '30px',
                          left: '40px',
                          color: '#ffffff',
                          fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        }}>
                          <div style={{ fontSize: '14px', letterSpacing: '2px', marginBottom: '8px' }}>SERVICES</div>
                          <div style={{ fontSize: '40px', fontWeight: '400', letterSpacing: '-0.02em' }}>AI Integration</div>
                        </div>
                      </div>
                      <div style={{
                        padding: '40px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <h2 style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '28px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '14px',
                            letterSpacing: '-0.02em',
                          }}>
                            AI Creative Solutions
                          </h2>
                          <p style={{
                            fontFamily: "'Questrial', sans-serif",
                            fontSize: '16px',
                            color: '#666666',
                            lineHeight: '1.6',
                          }}>
                            Leveraging artificial intelligence to transform business processes
                            and create innovative digital experiences.
                          </p>
                        </div>
                        <div style={{
                          marginTop: '24px',
                          paddingTop: '20px',
                          borderTop: '1px solid #e0e0e0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '14px',
                            color: '#999999',
                            letterSpacing: '1px',
                          }}>02 / 03</span>
                          <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '15px',
                            color: '#000000',
                          }}>
                            <span>LEARN MORE</span>
                            <NorthEastArrowIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CARD 3 - Berada di bawah Card 2 */}
                    <div
                      ref={(el) => setCard3Ref(el)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) translateY(10%)',
                        width: '90%',
                        height: '90%',
                        backgroundColor: '#ffffff',
                        borderRadius: '24px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        willChange: 'transform',
                      }}
                    >
                      <div style={{
                        height: '32%',
                        backgroundColor: '#2a2a2a',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <Image
                          src="/images/5.jpg"
                          alt="Card 3 Background"
                          fill
                          style={{ objectFit: 'cover', opacity: 0.75 }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '30px',
                          left: '40px',
                          color: '#ffffff',
                          fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        }}>
                          <div style={{ fontSize: '14px', letterSpacing: '2px', marginBottom: '8px' }}>COMMUNITY</div>
                          <div style={{ fontSize: '36px', fontWeight: '400', letterSpacing: '-0.02em' }}>Design Network</div>
                        </div>
                      </div>
                      <div style={{
                        padding: '36px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <h2 style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '26px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '12px',
                            letterSpacing: '-0.02em',
                          }}>
                            Global Design Community
                          </h2>
                          <p style={{
                            fontFamily: "'Questrial', sans-serif",
                            fontSize: '15px',
                            color: '#666666',
                            lineHeight: '1.6',
                          }}>
                            Join our growing network of designers, developers, and creative
                            professionals sharing knowledge and opportunities.
                          </p>
                        </div>
                        <div style={{
                          marginTop: '20px',
                          paddingTop: '18px',
                          borderTop: '1px solid #e0e0e0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '14px',
                            color: '#999999',
                            letterSpacing: '1px',
                          }}>03 / 03</span>
                          <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '15px',
                            color: '#000000',
                          }}>
                            <span>JOIN NOW</span>
                            <NorthEastArrowIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* SECTION TRUSTED COLLABS */}
            <div
              ref={trustedSectionRef}
              className="trusted-section"
              style={{
                backgroundColor: '#ffffff',
              }}
            >
              <div
                ref={trustedTextRef}
                className="trusted-text"
              >
                TRUSTED COLLABS
              </div>

              <div
                ref={carouselRef}
                className="carousel-container"
              >
                <div className="carousel-track">
                  {carouselItems.map((item) => (
                    <div key={item.id} className="carousel-item">
                      <div className="carousel-image">
                        <Image
                          src={item.image}
                          alt={item.brand}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <h3 className="carousel-brand">{item.brand}</h3>
                      <p className="carousel-desc">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CALENDAR SUBMISSIONS SECTION */}
            {calendarSubmissions.length > 0 && (
              <div className="calendar-submissions-section" style={{
                width: '100%',
                padding: '120px 80px',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  fontSize: '190px',
                  fontWeight: '400',
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '100px',
                  lineHeight: '1'
                }}>
                  <span>MEETING SCHEDULE</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '30px'
                  }}>
                    <span style={{
                      fontSize: '100px',
                      color: '#000000',
                      fontWeight: '400'
                    }}>
                      ({calendarSubmissions.length})
                    </span>
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '80px'
                }}>
                  {calendarSubmissions.map((submission, index) => {
                    const dateParts = getDateParts(submission.selectedDate);

                    return (
                      <div
                        key={submission.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: '80px'
                        }}
                      >
                        <div style={{
                          width: '200px',
                          flexShrink: 0,
                          textAlign: 'left'
                        }}>
                          <div style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '100px',
                            fontWeight: '400',
                            color: '#000000',
                            lineHeight: '1',
                            letterSpacing: '-0.02em'
                          }}>
                            {dateParts.day}
                          </div>
                          <div style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '40px',
                            fontWeight: '400',
                            color: '#000000',
                            letterSpacing: '-0.02em',
                            marginTop: '12px'
                          }}>
                            {dateParts.month}
                          </div>
                          <div style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '24px',
                            fontWeight: '400',
                            color: '#666666',
                            marginTop: '8px'
                          }}>
                            {dateParts.year}
                          </div>
                        </div>

                        <div style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '32px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '40px',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{
                              fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                              fontSize: '48px',
                              fontWeight: '400',
                              color: '#000000',
                              letterSpacing: '-0.02em'
                            }}>
                              {submission.fullName}
                            </div>
                            <div style={{
                              fontSize: '20px',
                              padding: '6px 24px',
                              border: '1px solid #000000',
                              backgroundColor: 'transparent',
                              color: '#000000',
                              fontWeight: '400',
                              fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                              letterSpacing: '0.02em'
                            }}>
                              {submission.status === 'pending' ? 'PENDING' :
                               submission.status === 'confirmed' ? 'CONFIRMED' :
                               submission.status === 'completed' ? 'COMPLETED' : 'REJECTED'}
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '60px',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1.5"/>
                                <polyline points="12 6 12 12 16 14" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{
                                fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                fontSize: '28px',
                                color: '#000000'
                              }}>
                                {submission.selectedTime} WIB
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#000000" strokeWidth="1.5"/>
                                <line x1="8" y1="2" x2="8" y2="6" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
                                <line x1="16" y1="2" x2="16" y2="6" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
                                <line x1="3" y1="10" x2="21" y2="10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                              <span style={{
                                fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                fontSize: '28px',
                                color: '#000000'
                              }}>
                                {submission.meetingType}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#000000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{
                                fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                fontSize: '28px',
                                color: '#000000'
                              }}>
                                {submission.platform === 'google_meet' ? 'Google Meet' :
                                 submission.platform === 'zoom' ? 'Zoom' :
                                 submission.platform === 'tatap_muka' ? 'Offline' : 'Via HP'}
                              </span>
                            </div>
                          </div>

                          <div style={{
                            marginTop: '16px'
                          }}>
                            <div style={{
                              fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                              fontSize: '20px',
                              fontWeight: '400',
                              color: '#999999',
                              marginBottom: '20px',
                              letterSpacing: '0.05em'
                            }}>
                              REASON TO TRUST
                            </div>
                            <div style={{
                              fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                              fontSize: '32px',
                              fontWeight: '400',
                              color: '#000000',
                              lineHeight: '1.4',
                              letterSpacing: '-0.01em'
                            }}>
                              "{submission.trustReason}"
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '48px',
                            flexWrap: 'wrap',
                            marginTop: '16px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="4" width="20" height="16" rx="2" ry="2" stroke="#000000" strokeWidth="1.5"/>
                                <polyline points="22 7 12 13 2 7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{
                                fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                fontSize: '22px',
                                color: '#000000'
                              }}>
                                {submission.email}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#000000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{
                                fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                fontSize: '22px',
                                color: '#000000'
                              }}>
                                {submission.phoneNumber}
                              </span>
                            </div>
                            {submission.companyName && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke="#000000" strokeWidth="1.5"/>
                                  <line x1="9" y1="4" x2="9" y2="20" stroke="#000000" strokeWidth="1.5"/>
                                  <line x1="15" y1="4" x2="15" y2="20" stroke="#000000" strokeWidth="1.5"/>
                                  <line x1="4" y1="9" x2="20" y2="9" stroke="#000000" strokeWidth="1.5"/>
                                  <line x1="4" y1="15" x2="20" y2="15" stroke="#000000" strokeWidth="1.5"/>
                                </svg>
                                <span style={{
                                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                  fontSize: '22px',
                                  color: '#000000'
                                }}>
                                  {submission.companyName}
                                </span>
                              </div>
                            )}
                          </div>

                          {submission.adminReply && (
                            <div style={{
                              marginTop: '24px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                marginBottom: '16px'
                              }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#000000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{
                                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                  fontSize: '18px',
                                  fontWeight: '400',
                                  color: '#999999',
                                  letterSpacing: '0.05em'
                                }}>
                                  ADMIN REPLY · {submission.adminReply.repliedBy}
                                </span>
                              </div>
                              <div style={{
                                fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                fontSize: '24px',
                                color: '#000000',
                                lineHeight: '1.4',
                                paddingLeft: '38px'
                              }}>
                                {submission.adminReply.text}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{
                          width: '220px',
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '24px'
                        }}>
                          <button
                            onClick={() => {
                              setShowCalendarModal(true);
                              setShowFormView(false);
                              setSelectedDate(null);
                              setSelectedTime("");
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '20px',
                              backgroundColor: 'transparent',
                              border: '1px solid #000000',
                              cursor: 'pointer',
                              fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                              fontSize: '20px',
                              fontWeight: '400',
                              color: '#000000',
                              padding: '16px 28px',
                              borderRadius: '0',
                              width: '100%'
                            }}
                          >
                            <span>BOOK CALL</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setReplyText(submission.adminReply?.text || "");
                                setReplyStatus(submission.status);
                                setShowReplyModal(true);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '20px',
                                backgroundColor: 'transparent',
                                border: '1px solid #000000',
                                cursor: 'pointer',
                                fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                                fontSize: '18px',
                                fontWeight: '400',
                                color: '#000000',
                                padding: '14px 24px',
                                borderRadius: '0',
                                width: '100%'
                              }}
                            >
                              <span>{submission.adminReply ? 'EDIT REPLY' : 'REPLY'}</span>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 7L7 17M7 17H17M7 17V7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* REPLY MODAL FOR ADMIN */}
            {showReplyModal && selectedSubmission && (
              <div className="reply-modal-overlay">
                <div className="reply-modal">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                    borderBottom: '1px solid #e0e0e0',
                    paddingBottom: '20px'
                  }}>
                    <h2 style={{
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontSize: '28px',
                      fontWeight: '400',
                      color: '#000000',
                      margin: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      REPLY TO MEETING
                    </h2>
                    <button
                      onClick={() => {
                        setShowReplyModal(false);
                        setSelectedSubmission(null);
                        setReplyText("");
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '28px',
                        cursor: 'pointer',
                        color: '#000000'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '0'
                  }}>
                    <div style={{
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      color: '#666666',
                      marginBottom: '8px'
                    }}>
                      FROM: {selectedSubmission.fullName} ({selectedSubmission.email})
                    </div>
                    <div style={{
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      color: '#666666',
                      marginBottom: '8px'
                    }}>
                      DATE: {selectedSubmission.selectedDateFormatted} - {selectedSubmission.selectedTime} WIB
                    </div>
                    <div style={{
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      color: '#000000',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #cccccc'
                    }}>
                      "{selectedSubmission.trustReason}"
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#000000',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      MEETING STATUS
                    </label>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '0',
                        border: '1px solid #cccccc',
                        fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        fontSize: '14px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="pending">PENDING</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="completed">COMPLETED</option>
                      <option value="rejected">REJECTED</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '28px' }}>
                    <label style={{
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#000000',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      REPLY MESSAGE
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply here..."
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '0',
                        border: '1px solid #cccccc',
                        fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        fontSize: '14px',
                        resize: 'vertical',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                      onClick={() => {
                        setShowReplyModal(false);
                        setSelectedSubmission(null);
                        setReplyText("");
                      }}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '0',
                        border: '1px solid #000000',
                        backgroundColor: 'transparent',
                        color: '#000000',
                        fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        fontSize: '16px',
                        fontWeight: '400',
                        cursor: 'pointer'
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleAdminReply}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '0',
                        border: '1px solid #000000',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        fontSize: '16px',
                        fontWeight: '400',
                        cursor: 'pointer'
                      }}
                    >
                      SEND REPLY
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bagian footer */}
            <div style={{
              width: '100%',
              position: 'relative',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              minHeight: '60vh'
            }}>
              <div
                ref={bottomContentRef}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '40px',
                  marginBottom: '80px',
                  paddingLeft: '80px',
                  opacity: 0
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div
                    ref={mencatatTextRef}
                    style={{
                      fontSize: '64px',
                      fontFamily: 'Questrial, sans-serif',
                      color: 'black',
                      textAlign: 'left',
                      fontWeight: '400',
                      letterSpacing: '-0.02em',
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap'
                    }}>
                    Mencatat apa yang kamu inginkan
                  </div>
                  <span style={{
                    fontSize: '80px',
                    color: 'black',
                    fontWeight: '400',
                    lineHeight: '1'
                  }}>.</span>
                </div>

                <Link href="/contact">
                  <button
                    ref={contactBtnRef}
                    onClick={handleContact}
                    className="contact-btn-effect"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 36px',
                      borderRadius: '60px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      fontWeight: '600',
                      letterSpacing: '-0.01em',
                      fontFamily: 'Questrial, sans-serif',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      zIndex: 1,
                      border: '1.5px solid #cccccc',
                      backgroundColor: '#ffffff',
                      color: '#000000'
                    }}
                  >
                    <span ref={contactTextRef}>Contact</span>

                    <div style={{
                      position: 'relative',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div className="dot-small" style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#000000',
                        opacity: 1,
                        transform: 'scale(1)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        position: 'absolute'
                      }}></div>

                      <div className="circle-large-white" style={{
                        position: 'absolute',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transform: 'scale(0.8)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                </Link>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '30px',
                  flexWrap: 'wrap',
                  width: '100%'
                }}>
                  <div ref={callTextRef} className="call-farid-text">
                    <div>Ready to surpass your</div>
                    <div>wildest dreams?</div>
                    <div>Call Farid.</div>
                  </div>

                  <button ref={calendarBtnRef} onClick={handleCalendarCall} className="calendar-btn">
                    <ArrowIcon size={24} />
                    Calendar call
                  </button>
                </div>

                <div
                  ref={profileRef}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '24px',
                    width: '100%',
                    marginTop: '10px'
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid #e0e0e0'
                  }}>
                    <Image
                      src="/images/5.jpg"
                      alt="Farid Ardiansyah"
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </div>

                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '40px',
                    fontWeight: '400',
                    color: 'rgb(16, 16, 16)',
                    letterSpacing: '-0.02em'
                  }}>
                    Farid Ardiansyah
                  </div>

                  <div className="badge-founder">
                    Founder & Programmer
                  </div>
                </div>
              </div>

              {/* Email dan Social Media Section */}
              <div style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                padding: '0 80px',
                marginBottom: '30px',
                boxSizing: 'border-box'
              }}>
                <div
                  ref={emailRef}
                  onClick={handleEmailClick}
                  className="email-wrapper"
                  style={{ marginBottom: '20px' }}
                >
                  <ArrowIcon size={24} />
                  <span className="email-text">contact.menuru@gmail.com</span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '20px'
                }}>
                  <div
                    className="social-item"
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialHover(textElement, originalTexts.ig);
                    }}
                    onMouseLeave={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialLeave(textElement, originalTexts.ig);
                    }}
                    onClick={() => handleSocialClick('Instagram')}
                  >
                    <span ref={igRef} className="social-text" style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '28px',
                      color: '#000000',
                      fontWeight: '400',
                      letterSpacing: '0.02em'
                    }}>Instagram</span>
                  </div>

                  <div
                    className="social-item"
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialHover(textElement, originalTexts.x);
                    }}
                    onMouseLeave={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialLeave(textElement, originalTexts.x);
                    }}
                    onClick={() => handleSocialClick('X')}
                  >
                    <span ref={xRef} className="social-text" style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '28px',
                      color: '#000000',
                      fontWeight: '400',
                      letterSpacing: '0.02em'
                    }}>X</span>
                  </div>

                  <div
                    className="social-item"
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialHover(textElement, originalTexts.linkedin);
                    }}
                    onMouseLeave={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialLeave(textElement, originalTexts.linkedin);
                    }}
                    onClick={() => handleSocialClick('LinkedIn')}
                  >
                    <span ref={linkedinRef} className="social-text" style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '28px',
                      color: '#000000',
                      fontWeight: '400',
                      letterSpacing: '0.02em'
                    }}>LinkedIn</span>
                  </div>
                </div>
              </div>

              <footer style={{
                position: 'relative',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                padding: '0 80px 0 0',
                margin: 0,
                pointerEvents: 'none',
                zIndex: 1,
                marginTop: '40px'
              }}>
                <span
                  ref={menuruTextRef}
                  style={{
                    fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                    fontWeight: 'normal',
                    fontSize: '600px',
                    color: '#000000',
                    textAlign: 'right',
                    letterSpacing: '-0.02em',
                    opacity: 1,
                    textTransform: 'uppercase',
                    lineHeight: '0.7',
                    whiteSpace: 'nowrap',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    fontKerning: 'normal',
                    margin: 0,
                    padding: 0,
                    marginRight: '0',
                    backgroundColor: 'transparent'
                  }}>
                  MENURU
                </span>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* SHADOW PAGE */}
      <div
        ref={shadowPageRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: '#000000',
          zIndex: 9998,
          transform: 'translateY(100%)',
          pointerEvents: showShadowPage ? 'auto' : 'none',
          overflow: 'hidden'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '80px',
            width: 'auto',
            textAlign: 'left',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            <span style={{
              fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
              fontWeight: '300',
              fontSize: '300px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              lineHeight: '0.9',
              opacity: 0.9
            }}>
              MENURU
            </span>
          </div>

          {!isChatVisible && (
            <button
              onClick={() => setIsChatVisible(true)}
              style={{
                position: 'absolute',
                bottom: '120px',
                right: '80px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '16px 32px',
                zIndex: 10,
                transition: 'opacity 0.3s ease',
                fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                fontSize: '20px',
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <span>BUKA CHAT</span>
              <NorthEastArrowIcon size={24} />
            </button>
          )}

          <div style={{
            position: 'absolute',
            top: '80px',
            left: '80px',
            color: '#ffffff',
            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
            zIndex: 5
          }}>
            <div style={{
              fontSize: '150px',
              fontWeight: '300',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: '1'
            }}>
              LET'S
            </div>
            <div style={{
              fontSize: '150px',
              fontWeight: '300',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: '1'
            }}>
              TALK
            </div>
          </div>

          {isChatVisible && (
            <div style={{
              position: 'absolute',
              bottom: '80px',
              right: '80px',
              width: '600px',
              height: '650px',
              backgroundColor: 'rgba(0,0,0,0.95)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 20,
              border: 'none'
            }}>
              <div style={{
                padding: '24px 28px',
                backgroundColor: 'transparent',
                borderBottom: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <span style={{
                    fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                    color: '#ffffff',
                    fontWeight: '300',
                    fontSize: '28px',
                    letterSpacing: '-0.02em'
                  }}>
                    CHAT
                  </span>
                  <span style={{
                    fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '16px',
                    fontWeight: '300'
                  }}>
                    {user ? (isAdmin ? 'ADMIN' : user.displayName || user.email?.split('@')[0]) : 'BELUM LOGIN'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {user && (
                    <button
                      onClick={handleLogout}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        padding: '4px 8px',
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <span>LOGOUT</span>
                      <NorthEastArrowIcon size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsChatVisible(false)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '28px',
                      padding: '0 4px',
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif"
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {replyTo && (
                <div style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  borderBottom: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  color: 'rgba(255,255,255,0.6)'
                }}>
                  <span>
                    REPLAY KE: <span style={{ color: '#ffffff' }}>{replyTo.name}</span> - "{replyTo.text.substring(0, 50)}..."
                  </span>
                  <button
                    onClick={cancelReply}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '20px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <div
                ref={chatContainerRef}
                className="chat-messages"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                {messages.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    padding: '80px 20px',
                    fontSize: '18px',
                    fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                    fontWeight: '300'
                  }}>
                    BELUM ADA PESAN
                  </div>
                )}

                {messages.map((msg) => {
                  const isOwnMessage = user?.uid === msg.userId;
                  const isAdminMessage = msg.isAdmin === true;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                        maxWidth: '90%',
                        alignSelf: isOwnMessage ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.5)',
                        fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif"
                      }}>
                        <span style={{
                          color: '#ffffff',
                          fontWeight: '300',
                          fontSize: '15px'
                        }}>
                          {msg.userName}
                          {isAdminMessage && ' [ADMIN]'}
                        </span>
                        <span>{msg.timestamp ? formatTime(msg.timestamp) : ''}</span>
                        <span style={{ fontSize: '11px' }}>
                          {msg.timestamp ? formatDate(msg.timestamp) : ''}
                        </span>
                        {user && !isOwnMessage && (
                          <button
                            onClick={() => handleReply(msg)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: 'rgba(255,255,255,0.4)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            REPLY
                          </button>
                        )}
                      </div>

                      {msg.replyTo && (
                        <div style={{
                          marginBottom: '8px',
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.4)',
                          fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                          maxWidth: '100%'
                        }}>
                          REPLAY KE <span style={{ color: '#ffffff' }}>{msg.replyTo.userName}</span>: "{msg.replyTo.text}"
                        </div>
                      )}

                      <div style={{
                        color: '#ffffff',
                        padding: '14px 20px',
                        fontSize: '16px',
                        fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                        fontWeight: '300',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.5'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {user ? (
                <div style={{
                  padding: '20px 28px',
                  borderTop: 'none',
                  display: 'flex',
                  gap: '16px',
                  backgroundColor: 'transparent'
                }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="TULIS PESAN..."
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      padding: '14px 20px',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontWeight: '300',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '10px 28px',
                      color: newMessage.trim() ? '#ffffff' : 'rgba(255,255,255,0.3)',
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontSize: '16px',
                      fontWeight: '300',
                      cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span>KIRIM</span>
                    <NorthEastArrowIcon size={16} />
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '20px 28px',
                  borderTop: 'none',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '14px 32px',
                      color: '#ffffff',
                      fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                      fontSize: '16px',
                      fontWeight: '300',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <span>LOGIN UNTUK CHAT</span>
                    <NorthEastArrowIcon size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 20000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#000000',
            border: 'none',
            padding: '60px',
            width: '90%',
            maxWidth: '550px',
            color: '#ffffff',
            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif"
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '50px'
            }}>
              <div>
                <div style={{
                  fontSize: '70px',
                  fontWeight: '300',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: '1',
                  color: '#ffffff'
                }}>
                  {authMode === 'login' ? 'LOGIN' : 'DAFTAR'}
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '300',
                  marginTop: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '-0.01em'
                }}>
                  {authMode === 'login' ? 'MASUK KE AKUN ANDA' : 'BUAT AKUN BARU'}
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '32px',
                  cursor: 'pointer',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexDirection: 'column' }}>
              <button
                onClick={handleGoogleLogin}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '18px 28px',
                  fontSize: '18px',
                  fontWeight: '300',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span>GOOGLE</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
                  <path d="M15.1 12.5c0-.4-.03-.7-.1-1H12v2h1.8c-.2.5-.6.9-1.1 1.2v1h1.8c1-.9 1.6-2.3 1.6-3.2z" fill="#34A853" fillOpacity="0.7"/>
                  <path d="M9.6 14.3c-.3-.5-.5-1.1-.5-1.8s.2-1.3.5-1.8v-1.3H7.8c-.6 1-.9 2-.9 3.1 0 1.1.3 2.1.9 3.1l1.8-1.3z" fill="#FBBC05" fillOpacity="0.7"/>
                  <path d="M12 5.4c.9 0 1.7.3 2.4.9l1.7-1.7C15.1 3.8 13.6 3 12 3 9.1 3 6.6 4.6 5.4 7.2l2 1.5c.5-1 1.5-1.8 2.6-2.1z" fill="#EA4335" fillOpacity="0.7"/>
                  <path d="M3 12c0 1.1.2 2.1.6 3.1L6.5 13c-.1-.3-.1-.7-.1-1s0-.7.1-1L3.6 8.9C3.2 9.9 3 10.9 3 12z" fill="#34A853" fillOpacity="0.7"/>
                </svg>
              </button>
              <button
                onClick={handleGithubLogin}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '18px 28px',
                  fontSize: '18px',
                  fontWeight: '300',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span>GITHUB</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.21.68-.48 0-.24-.01-.88-.01-1.73-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z" fill="#ffffff" fillOpacity="0.8"/>
                </svg>
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.3)',
              margin: '30px 0',
              fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
              fontSize: '16px',
              fontWeight: '300',
              position: 'relative'
            }}>
              <span style={{ backgroundColor: '#000000', padding: '0 20px' }}>ATAU</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="NAMA"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  style={{
                    padding: '18px 0',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontSize: '18px',
                    fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                    fontWeight: '300',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderBottomColor = '#ffffff'}
                  onBlur={(e) => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)'}
                />
              )}
              <input
                type="email"
                placeholder="EMAIL"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{
                  padding: '18px 0',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  fontWeight: '300',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderBottomColor = '#ffffff'}
                onBlur={(e) => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)'}
              />
              <input
                type="password"
                placeholder="PASSWORD"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{
                  padding: '18px 0',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  fontWeight: '300',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderBottomColor = '#ffffff'}
                onBlur={(e) => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)'}
              />
              {authError && (
                <div style={{
                  color: '#ff4444',
                  fontSize: '14px',
                  textAlign: 'center',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  fontWeight: '300',
                  padding: '10px'
                }}>
                  {authError}
                </div>
              )}
              <button
                onClick={authMode === 'login' ? handleEmailLogin : handleEmailRegister}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '18px 0',
                  fontSize: '18px',
                  fontWeight: '300',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  marginTop: '10px',
                  transition: 'opacity 0.2s',
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  marginTop: '30px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span>{authMode === 'login' ? 'LOGIN' : 'DAFTAR'}</span>
                <NorthEastArrowIcon size={20} />
              </button>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                  fontWeight: '300',
                  marginTop: '10px',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {authMode === 'login' ? 'BELUM PUNYA AKUN? DAFTAR' : 'SUDAH PUNYA AKUN? LOGIN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR CALL MODAL */}
      {showCalendarModal && (
        <div className="calendar-modal-overlay">
          <div ref={modalRef} className="calendar-modal" style={{ maxWidth: '1300px', maxHeight: '85vh', overflow: 'auto' }}>
            {!showFormView ? (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                height: 'auto',
                minHeight: '620px'
              }}>
                <div style={{
                  flex: 1.1,
                  padding: '36px',
                  borderRight: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '28px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <div style={{
                      width: '75px',
                      height: '95px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '2px solid #e0e0e0'
                    }}>
                      <Image
                        src="/images/5.jpg"
                        alt="Farid Ardiansyah"
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                    </div>
                    <div>
                      <div style={{
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '26px',
                        fontWeight: '600',
                        color: '#000000'
                      }}>
                        {user?.displayName || user?.email?.split('@')[0] || 'Guest'}
                      </div>
                      <div style={{
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        color: '#666666'
                      }}>
                        {user?.email === ADMIN_EMAIL ? 'Administrator' : (user ? 'Member' : 'Guest User')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '10px'
                    }}>Tentang Kerjasama</div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      color: '#666666',
                      lineHeight: '1.5'
                    }}>
                      Diskusi tentang kolaborasi pengembangan website, aplikasi mobile,
                      atau konsultasi teknologi. Saya siap membantu mewujudkan ide digital Anda!
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '8px'
                    }}>Waktu Tunggu Respon</div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '13px',
                      color: '#c5e800',
                      backgroundColor: '#1a1a1a',
                      display: 'inline-block',
                      padding: '5px 14px',
                      borderRadius: '60px'
                    }}>Maksimal 1x24 jam</div>
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '14px'
                    }}>Tipe Meeting</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {["Online", "Offline", "Hybrid"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setMeetingType(type)}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '60px',
                            border: meetingType === type ? '2px solid #000000' : '1px solid #cccccc',
                            backgroundColor: meetingType === type ? '#000000' : '#ffffff',
                            color: meetingType === type ? '#ffffff' : '#000000',
                            cursor: 'pointer',
                            fontFamily: "'Questrial', sans-serif",
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{
                  flex: 2,
                  padding: '36px',
                  borderRight: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '28px'
                  }}>
                    <button
                      onClick={() => changeMonth(-1)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '12px',
                        border: '1px solid #cccccc',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Prev
                    </button>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '22px',
                      fontWeight: '600',
                      color: '#000000'
                    }}>
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button
                      onClick={() => changeMonth(1)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '12px',
                        border: '1px solid #cccccc',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      Next
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '6px',
                    marginBottom: '14px'
                  }}>
                    {weekDays.map((day) => (
                      <div key={day} style={{
                        textAlign: 'center',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#999999',
                        padding: '10px'
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '6px'
                  }}>
                    {days.map((date, index) => (
                      <div
                        key={index}
                        onClick={() => date && handleDateSelect(date)}
                        className="calendar-day"
                        style={{
                          textAlign: 'center',
                          padding: '14px 6px',
                          backgroundColor: date ? getDayColor(date) : 'transparent',
                          color: date ? '#ffffff' : 'transparent',
                          cursor: date ? 'pointer' : 'default',
                          fontWeight: date ? '600' : 'normal',
                          borderRadius: '14px',
                          opacity: date ? 1 : 0.3,
                          fontSize: '16px',
                          boxShadow: selectedDate?.toDateString() === date?.toDateString() ? '0 0 0 2px #000000' : 'none',
                          position: 'relative'
                        }}
                      >
                        {date ? date.getDate() : ''}
                      </div>
                    ))}
                  </div>

                  {selectedDate && (
                    <div style={{ marginTop: '28px' }}>
                      <div style={{
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#000000',
                        marginBottom: '16px'
                      }}>
                        Pilih Waktu - {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className="time-slot"
                            style={{
                              padding: '10px 22px',
                              borderRadius: '60px',
                              border: selectedTime === time ? '2px solid #000000' : '1px solid #cccccc',
                              backgroundColor: selectedTime === time ? '#000000' : '#ffffff',
                              color: selectedTime === time ? '#ffffff' : '#000000',
                              cursor: 'pointer',
                              fontFamily: "'Questrial', sans-serif",
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            {time} WIB
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{
                  flex: 1.1,
                  padding: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#000000',
                    paddingBottom: '14px',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Rekomendasi Jadwal
                  </div>

                  <div
                    onClick={() => {
                      setSelectedDate(tomorrow);
                      setSelectedTime("10:00");
                    }}
                    style={{
                      padding: '22px',
                      backgroundColor: '#c5e800',
                      borderRadius: '20px',
                      color: '#000000',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1.5"/>
                        <path d="M12 8v4l3 3" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      BESOK
                    </div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '8px'
                    }}>
                      {tomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '15px',
                      fontWeight: '500',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {timeSlots[2]} - {timeSlots[4]} WIB
                    </div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '12px',
                      opacity: 0.7
                    }}>
                      Slot terbaik
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedDate(dayAfterTomorrow);
                      setSelectedTime("13:00");
                    }}
                    style={{
                      padding: '22px',
                      backgroundColor: '#ff69b4',
                      borderRadius: '20px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z" stroke="#ffffff" strokeWidth="1.5" fill="none"/>
                      </svg>
                      LUSA
                    </div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '8px'
                    }}>
                      {dayAfterTomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '15px',
                      fontWeight: '500',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {timeSlots[1]} - {timeSlots[3]} WIB
                    </div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '12px',
                      opacity: 0.7
                    }}>
                      Paling diminati
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '16px',
                    flexDirection: 'column'
                  }}>
                    <button
                      onClick={() => setShowCalendarModal(false)}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: '2px solid #cccccc',
                        borderRadius: '60px',
                        cursor: 'pointer',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#000000';
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cccccc';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <NorthWestArrowIcon size={18} />
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (selectedDate && selectedTime) {
                          setShowFormView(true);
                        } else {
                          alert("Silakan pilih tanggal dan waktu terlebih dahulu!");
                        }
                      }}
                      style={{
                        padding: '14px 20px',
                        backgroundColor: '#0000ff',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '60px',
                        cursor: 'pointer',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2200dd';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0000ff';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      Schedule Meeting
                      <NorthEastArrowIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                height: 'auto',
                minHeight: '620px',
                maxHeight: '85vh'
              }}>
                <div style={{
                  flex: 1.1,
                  padding: '36px',
                  borderRight: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '28px',
                  height: 'calc(85vh - 72px)',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <div style={{
                      width: '75px',
                      height: '95px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '2px solid #e0e0e0'
                    }}>
                      <Image
                        src="/images/5.jpg"
                        alt="Farid Ardiansyah"
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                    </div>
                    <div>
                      <div style={{
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '26px',
                        fontWeight: '600',
                        color: '#000000'
                      }}>Farid Ardiansyah</div>
                      <div style={{
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        color: '#666666'
                      }}>Founder & Programmer</div>
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '14px'
                    }}>Ringkasan Meeting</div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      color: '#666666',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Tanggal:</strong> {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Waktu:</strong> {selectedTime} WIB
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Tipe Meeting:</strong> {meetingType}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '8px'
                    }}>Waktu Tunggu Respon</div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '13px',
                      color: '#c5e800',
                      backgroundColor: '#1a1a1a',
                      display: 'inline-block',
                      padding: '5px 14px',
                      borderRadius: '60px'
                    }}>Maksimal 1x24 jam</div>
                  </div>
                </div>

                <div style={{
                  flex: 2.2,
                  padding: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  height: 'calc(85vh - 72px)',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#000000',
                    paddingBottom: '14px',
                    borderBottom: '2px solid #e0e0e0',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#ffffff',
                    zIndex: 10
                  }}>
                    Isi Data Diri
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '6px'
                    }}>
                      Nama Lengkap <span style={{ color: '#ff4444' }}>*</span>
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      defaultValue={user?.displayName || user?.email?.split('@')[0] || ""}
                      placeholder="Masukkan nama lengkap Anda"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #cccccc',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#000000'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'}
                    />
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '6px'
                    }}>
                      Email Address <span style={{ color: '#ff4444' }}>*</span>
                    </div>
                    <input
                      type="email"
                      id="emailAddress"
                      defaultValue={user?.email || ""}
                      placeholder="contoh@email.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #cccccc',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#000000'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'}
                    />
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '6px'
                    }}>
                      Platform Meeting <span style={{ color: '#ff4444' }}>*</span>
                    </div>
                    <select
                      id="locationOption"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #cccccc',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Pilih platform meeting</option>
                      <option value="google_meet">Google Meet</option>
                      <option value="zoom">Zoom</option>
                      <option value="tatap_muka">Tatap Muka (Offline)</option>
                      <option value="via_hp">Via Nomor HP (Telepon/WA)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '6px'
                    }}>
                      Nama Perusahaan / Instansi
                    </div>
                    <input
                      type="text"
                      id="companyName"
                      placeholder="Masukkan nama perusahaan Anda"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #cccccc',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#000000'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'}
                    />
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '6px'
                    }}>
                      Kenapa Anda percaya dengan saya? <span style={{ color: '#ff4444' }}>*</span>
                    </div>
                    <textarea
                      id="trustReason"
                      placeholder="Ceritakan alasan Anda percaya dan ingin berkolaborasi..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #cccccc',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#000000'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'}
                    />
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '6px'
                    }}>
                      Nomor WhatsApp / HP <span style={{ color: '#ff4444' }}>*</span>
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      placeholder="+62 xxx-xxxx-xxxx"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #cccccc',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#000000'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'}
                    />
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '6px'
                    }}>
                      Tambah Guest (Opsional)
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="email"
                        id="guestEmail"
                        placeholder="Email guest (maks 3 orang)"
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid #cccccc',
                          fontFamily: "'Questrial', sans-serif",
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        id="addGuestBtn"
                        style={{
                          padding: '10px 20px',
                          borderRadius: '12px',
                          border: '1px solid #000000',
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          cursor: 'pointer',
                          fontFamily: "'Questrial', sans-serif",
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        + Add
                      </button>
                    </div>
                    <div id="guestList" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}></div>
                  </div>

                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '12px',
                      color: '#666666'
                    }}>
                      By proceeding, you agree to <span style={{ color: '#000000', fontWeight: '600', cursor: 'pointer' }}>Menuru Terms</span> and
                      <span style={{ color: '#000000', fontWeight: '600', cursor: 'pointer' }}> Privacy Policy</span>.
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '14px',
                    marginTop: '16px',
                    marginBottom: '8px',
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: '#ffffff',
                    paddingTop: '12px',
                    paddingBottom: '8px'
                  }}>
                    <button
                      onClick={() => setShowFormView(false)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: '2px solid #cccccc',
                        borderRadius: '60px',
                        cursor: 'pointer',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#000000';
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cccccc';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <NorthWestArrowIcon size={18} />
                      Back
                    </button>
                    <button
                      onClick={handleConfirmMeeting}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        backgroundColor: '#0000ff',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '60px',
                        cursor: 'pointer',
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2200dd';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0000ff';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      Confirm
                      <NorthEastArrowIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cookie Popup */}
      {showPopup && !isLoading && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          right: '30px',
          backgroundColor: '#000000',
          color: '#ffffff',
          borderRadius: '32px',
          padding: '28px 40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 5px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontFamily: 'Questrial, sans-serif',
          animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '40px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '48px', display: 'inline-block' }}>🍪</span>
              <span style={{
                fontWeight: '700',
                fontSize: '32px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'Questrial, sans-serif'
              }}>Cookies Notice</span>
            </div>

            <p style={{
              fontSize: '18px',
              lineHeight: '1.5',
              marginBottom: 0,
              color: '#ffffff',
              fontWeight: '400',
              letterSpacing: '-0.01em',
              maxWidth: '600px',
              fontFamily: 'Questrial, sans-serif'
            }}>
              This site uses cookies to provide you with the best user experience.
              By using this website, you accept our use of cookies.
            </p>

            <Link href="/privacy-policy" passHref>
              <span
                className="cookie-link"
                style={{
                  color: '#aaaaaa',
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '4px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'Questrial, sans-serif',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#aaaaaa'}
              >
                Show details
                <NorthEastArrowIcon size={14} />
              </span>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', flexShrink: 0 }}>
            <button
              ref={declineBtnRef}
              onClick={handleDecline}
              style={{
                padding: '12px 28px',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: '1.5px solid #333333',
                borderRadius: '60px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                fontFamily: 'Questrial, sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: '#000000'
              }}
            >
              Decline
            </button>
            <button
              ref={acceptBtnRef}
              onClick={handleAccept}
              style={{
                padding: '12px 28px',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: '1.5px solid #ffffff',
                borderRadius: '60px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                fontFamily: 'Questrial, sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: '#000000'
              }}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
