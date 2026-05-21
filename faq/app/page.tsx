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
  arrayUnion
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

const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

// Interfaces
interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  userEmail?: string;
  isAdmin?: boolean;
  replyTo?: { messageId: string; userName: string; text: string };
  timestamp: Timestamp;
}

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
  adminReply?: { text: string; repliedAt: Timestamp; repliedBy: string };
  createdAt: Timestamp;
  userId?: string;
  userEmail?: string;
}

interface CommunityMember {
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  joinedAt: Timestamp;
}

interface Community {
  id: string;
  name: string;
  description: string;
  members: CommunityMember[];
  memberCount: number;
  link?: string;
  createdAt: Timestamp;
}

interface Donation {
  id: string;
  orphanageName: string;
  donorName: string;
  amount: number;
  date: Date;
  message: string;
  photos: string[];
  createdAt: Timestamp;
}

interface PhotoComment {
  id: string;
  photoIndex: number;
  userName: string;
  userPhoto?: string;
  text: string;
  timestamp: Timestamp;
}

const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

// Default data
const defaultCommunities = [
  { id: "education", name: "EDUCATION", description: "Tempat belajar bersama tentang perkembangan teknologi, desain, dan inovasi digital.", link: "/community/education" },
  { id: "programming", name: "PROGRAMMING", description: "Komunitas untuk para developer dan programmer.", link: "/community/programming" },
  { id: "persib", name: "PERSIB", description: "Komunitas Bobotoh Persib Bandung.", link: "/community/persib" },
  { id: "pointblank", name: "POINT BLANK", description: "Komunitas gamer Point Blank.", link: "/community/pointblank" },
  { id: "cleanliness", name: "CLEANLINESS", description: "Komunitas peduli kebersihan lingkungan.", link: "/community/cleanliness" },
  { id: "general", name: "GENERAL", description: "Komunitas umum untuk diskusi ringan.", link: "/community/general" }
];

const defaultDonation: Donation = {
  id: "1",
  orphanageName: "Panti Asuhan Al-Falah",
  donorName: "Farid Ardiansyah",
  amount: 10000000,
  date: new Date(2026, 4, 23),
  message: "Sebagai rasa syukur kepada Allah SWT atas kebahagiaan yang telah diberikan. PERSIB Bandung telah menjadi juara HATTRICK Liga 1 Indonesia pada tanggal 23 Mei 2026. Kemenangan ini membawa kebahagiaan yang luar biasa bagi seluruh bobotoh. Semoga donasi ini bermanfaat untuk anak-anak di Panti Asuhan Al-Falah.",
  photos: ["/images/lkhh.jpg", "/images/ai.jpg", "/images/5.jpg", "/images/lkhh.jpg"],
  createdAt: serverTimestamp() as Timestamp
};

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

const ArrowIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VerifiedBadge = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.5 12.5C22.5 13.6 22.4 14.7 22.2 15.8C21.9 17.3 20.9 18.6 19.5 19.3C18.1 20 16.5 20.1 15 19.6C14.5 19.4 14 19.1 13.5 18.8C12.9 18.4 12.2 18.2 11.5 18.2C10.8 18.2 10.1 18.4 9.5 18.8C9 19.1 8.5 19.4 8 19.6C6.5 20.1 4.9 20 3.5 19.3C2.1 18.6 1.1 17.3 0.8 15.8C0.6 14.7 0.5 13.6 0.5 12.5C0.5 11.4 0.6 10.3 0.8 9.2C1.1 7.7 2.1 6.4 3.5 5.7C4.9 5 6.5 4.9 8 5.4C8.5 5.6 9 5.9 9.5 6.2C10.1 6.6 10.8 6.8 11.5 6.8C12.2 6.8 12.9 6.6 13.5 6.2C14 5.9 14.5 5.6 15 5.4C16.5 4.9 18.1 5 19.5 5.7C20.9 6.4 21.9 7.7 22.2 9.2C22.4 10.3 22.5 11.4 22.5 12.5Z" fill="#1DA1F2" stroke="white" strokeWidth="1.5"/>
    <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showFormView, setShowFormView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [meetingType, setMeetingType] = useState<string>("Online");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [featuresBgColor, setFeaturesBgColor] = useState('#0000ff');
  const [featuresTextColor, setFeaturesTextColor] = useState('#ffffff');
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

  // State untuk Community
  const [communities, setCommunities] = useState<Community[]>([]);
  const [openCommunityId, setOpenCommunityId] = useState<string | null>(null);

  // State untuk Donations
  const [donation, setDonation] = useState<Donation | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [photoComments, setPhotoComments] = useState<{ [key: number]: PhotoComment[] }>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentCommentPhotoIndex, setCurrentCommentPhotoIndex] = useState<number>(0);

  // Hover states
  const [noteHover, setNoteHover] = useState(false);
  const [communityHover, setCommunityHover] = useState(false);
  const [calendarHover, setCalendarHover] = useState(false);
  const [blogHover, setBlogHover] = useState(false);
  const [donationHover, setDonationHover] = useState(false);

  // Refs
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardsSectionRef = useRef<HTMLDivElement>(null);
  const cardsPinnedRef = useRef<HTMLDivElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const menuruTopMainRef = useRef<HTMLDivElement>(null);
  const studioTextRef = useRef<HTMLDivElement>(null);
  const bottomLeftTextRef = useRef<HTMLDivElement>(null);
  const mencatatTextRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const callTextRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const bottomContentRef = useRef<HTMLDivElement>(null);
  const calendarBtnRef = useRef<HTMLButtonElement>(null);
  const img1Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLDivElement>(null);

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
    { id: 1, image: "/images/lkhh.jpg", brand: "LKHH Studio", description: "Creative digital agency specializing in branding and web design." },
    { id: 2, image: "/images/ai.jpg", brand: "AI Creative", description: "Artificial intelligence solutions for modern businesses." },
    { id: 3, image: "/images/5.jpg", brand: "Farid Corp", description: "Technology consulting and software development." },
    { id: 4, image: "/images/lkhh.jpg", brand: "Studio Beta", description: "UI/UX design and product innovation." },
    { id: 5, image: "/images/ai.jpg", brand: "Gamma Labs", description: "Research and development in emerging technologies." },
    { id: 6, image: "/images/5.jpg", brand: "Delta Creative", description: "Content creation and digital marketing." }
  ];

  const originalTexts = { ig: 'Instagram', x: 'X', linkedin: 'LinkedIn' };

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today); dayAfterTomorrow.setDate(today.getDate() + 2);
  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getDayColor = (date: Date) => {
    if (date.toDateString() === today.toDateString()) return "#c5e800";
    if (date.toDateString() === tomorrow.toDateString()) return "#ff69b4";
    return "#4a90e2";
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateSelect = (date: Date) => setSelectedDate(date);
  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const handleConfirmMeeting = async () => {
    const fullName = (document.getElementById('fullName') as HTMLInputElement)?.value;
    const emailAddress = (document.getElementById('emailAddress') as HTMLInputElement)?.value;
    const locationOption = (document.getElementById('locationOption') as HTMLSelectElement)?.value;
    const companyName = (document.getElementById('companyName') as HTMLInputElement)?.value;
    const trustReason = (document.getElementById('trustReason') as HTMLTextAreaElement)?.value;
    const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement)?.value;

    if (!fullName?.trim() || !emailAddress?.trim() || !locationOption || !trustReason?.trim() || !phoneNumber?.trim()) {
      alert("Harap isi semua field yang diperlukan!");
      return;
    }
    if (!selectedDate || !selectedTime) {
      alert("Silakan pilih tanggal dan waktu meeting terlebih dahulu!");
      return;
    }

    const guestEmails: string[] = [];
    document.querySelectorAll('#guestList .guest-item').forEach(item => {
      const email = item.getAttribute('data-email');
      if (email) guestEmails.push(email);
    });

    try {
      if (db) {
        await addDoc(collection(db, "calendar_submissions"), {
          fullName: fullName.trim(), email: emailAddress.trim(), phoneNumber: phoneNumber.trim(),
          companyName: companyName?.trim() || "", trustReason: trustReason.trim(), meetingType, platform: locationOption,
          selectedDate: selectedDate.toISOString(), selectedDateFormatted: selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          selectedTime, guests: guestEmails, status: 'pending', createdAt: serverTimestamp(),
          userId: user?.uid || null, userEmail: user?.email || null, userName: user?.displayName || user?.email?.split('@')[0] || fullName.trim()
        });
        alert("Jadwal meeting berhasil disimpan!");
      }
    } catch (error) { console.error(error); alert("Terjadi kesalahan!"); }

    setShowCalendarModal(false); setShowFormView(false); setSelectedDate(null); setSelectedTime("");
    ['fullName', 'emailAddress', 'companyName', 'trustReason', 'phoneNumber'].forEach(id => {
      const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
      if (input) input.value = '';
    });
    const locationSelect = document.getElementById('locationOption') as HTMLSelectElement;
    if (locationSelect) locationSelect.value = '';
    const guestList = document.getElementById('guestList');
    if (guestList) guestList.innerHTML = '';
  };

  const handleAdminReply = async () => {
    if (!selectedSubmission || !replyText.trim() || !isAdmin) return;
    try {
      await updateDoc(doc(db, "calendar_submissions", selectedSubmission.id), {
        status: replyStatus, adminReply: { text: replyText.trim(), repliedAt: serverTimestamp(), repliedBy: user?.displayName || "ADMIN" }
      });
      setShowReplyModal(false); setSelectedSubmission(null); setReplyText("");
      alert("Balasan telah dikirim!");
    } catch (error) { console.error(error); alert("Gagal mengirim balasan."); }
  };

  // Firebase Effects
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(query(collection(db, "calendar_submissions"), orderBy("createdAt", "desc")), (snapshot) => {
      const submissions: CalendarSubmission[] = [];
      snapshot.forEach((doc) => submissions.push({ id: doc.id, ...doc.data() } as CalendarSubmission));
      setCalendarSubmissions(submissions);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const loadCommunities = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "communities")));
        if (snapshot.empty) {
          for (const comm of defaultCommunities) await addDoc(collection(db, "communities"), { ...comm, members: [], memberCount: 0, createdAt: serverTimestamp() });
          const newSnapshot = await getDocs(query(collection(db, "communities")));
          const loaded: Community[] = [];
          newSnapshot.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Community));
          setCommunities(loaded);
        } else {
          const loaded: Community[] = [];
          snapshot.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Community));
          setCommunities(loaded);
        }
      } catch (error) { console.error(error); }
    };
    loadCommunities();
  }, []);

  useEffect(() => {
    if (!db) return;
    const loadDonation = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "donations"), orderBy("createdAt", "desc"), limit(1)));
        if (snapshot.empty) {
          await addDoc(collection(db, "donations"), { ...defaultDonation, createdAt: serverTimestamp() });
          setDonation(defaultDonation);
        } else {
          const docData = snapshot.docs[0];
          setDonation({ id: docData.id, ...docData.data() } as Donation);
        }
      } catch (error) { console.error(error); setDonation(defaultDonation); }
    };
    loadDonation();
  }, []);

  useEffect(() => {
    if (!db || !donation) return;
    const unsubscribe = onSnapshot(query(collection(db, "donation_comments"), orderBy("timestamp", "asc")), (snapshot) => {
      const commentsByPhoto: { [key: number]: PhotoComment[] } = {};
      snapshot.forEach((doc) => {
        const comment = { id: doc.id, ...doc.data() } as PhotoComment;
        if (!commentsByPhoto[comment.photoIndex]) commentsByPhoto[comment.photoIndex] = [];
        commentsByPhoto[comment.photoIndex].push(comment);
      });
      setPhotoComments(commentsByPhoto);
    });
    return () => unsubscribe();
  }, [donation]);

  const addComment = async () => {
    if (!newCommentText.trim() || !user) { alert("Silakan login terlebih dahulu!"); setShowAuthModal(true); return; }
    try {
      await addDoc(collection(db, "donation_comments"), {
        photoIndex: currentCommentPhotoIndex, userName: user.displayName || user.email?.split('@')[0] || "User",
        userPhoto: user.photoURL || null, text: newCommentText.trim(), timestamp: serverTimestamp()
      });
      setNewCommentText(""); setShowCommentModal(false);
    } catch (error) { console.error(error); alert("Gagal menambahkan komentar."); }
  };

  const joinCommunity = async (communityId: string, communityName: string) => {
    if (!user) { alert("Silakan login terlebih dahulu!"); setShowAuthModal(true); return; }
    try {
      const q = query(collection(db, "communities"), where("name", "==", communityName));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docRef = doc(db, "communities", snapshot.docs[0].id);
        const current = snapshot.docs[0].data() as Community;
        if (current.members?.some(m => m.userId === user.uid)) { alert(`Anda sudah bergabung di ${communityName}`); return; }
        await updateDoc(docRef, { members: arrayUnion({ userId: user.uid, userName: user.displayName || user.email?.split('@')[0] || "User", userEmail: user.email || "", joinedAt: serverTimestamp() }), memberCount: (current.memberCount || 0) + 1 });
        alert(`Selamat! Anda telah bergabung ke ${communityName}`);
      }
    } catch (error) { console.error(error); alert("Gagal bergabung."); }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) { setUser(currentUser); setIsAdmin(currentUser.email === ADMIN_EMAIL); }
      else { setUser(null); setIsAdmin(false); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(query(collection(db, "chat_messages"), orderBy("timestamp", "asc"), limit(200)), (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => newMessages.push({ id: doc.id, ...doc.data() } as Message));
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !db) return;
    try {
      const messageData: any = {
        text: newMessage.trim(), userId: user.uid, userName: isAdmin ? "ADMIN" : (user.displayName || user.email?.split('@')[0] || "User"),
        userEmail: user.email, isAdmin, timestamp: serverTimestamp()
      };
      if (replyTo) messageData.replyTo = { messageId: replyTo.id, userName: replyTo.name, text: replyTo.text.substring(0, 100) };
      await addDoc(collection(db, "chat_messages"), messageData);
      setNewMessage(""); setReplyTo(null);
    } catch (error) { console.error(error); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleReply = (message: Message) => setReplyTo({ id: message.id, name: message.userName, text: message.text });
  const cancelReply = () => setReplyTo(null);
  const handleGoogleLogin = async () => { try { const result = await signInWithPopup(auth!, googleProvider); setUser(result.user); setShowAuthModal(false); setAuthError(""); } catch (error: any) { setAuthError(error.message); } };
  const handleGithubLogin = async () => { try { const result = await signInWithPopup(auth!, githubProvider); setUser(result.user); setShowAuthModal(false); setAuthError(""); } catch (error: any) { setAuthError(error.message); } };
  const handleEmailLogin = async () => { try { const result = await signInWithEmailAndPassword(auth!, authEmail, authPassword); setUser(result.user); setShowAuthModal(false); setAuthEmail(""); setAuthPassword(""); setAuthError(""); } catch (error: any) { setAuthError(error.message); } };
  const handleEmailRegister = async () => { try { const result = await createUserWithEmailAndPassword(auth!, authEmail, authPassword); if (authName.trim()) await updateProfile(result.user, { displayName: authName }); setUser(result.user); setShowAuthModal(false); setAuthEmail(""); setAuthPassword(""); setAuthName(""); setAuthError(""); } catch (error: any) { setAuthError(error.message); } };
  const handleLogout = async () => { try { await signOut(auth!); setIsChatVisible(false); setReplyTo(null); } catch (error) { console.error(error); } };

  const handleAccept = () => { localStorage.setItem('cookieConsent', 'accepted'); setShowPopup(false); };
  const handleDecline = () => { localStorage.setItem('cookieConsent', 'declined'); setShowPopup(false); };
  const handleContact = () => {};
  const handleEmailClick = () => { window.location.href = 'mailto:contact.menuru@gmail.com'; };
  const handleSocialClick = (platform: string) => {};
  const handleCalendarCall = () => { setShowCalendarModal(true); setShowFormView(false); setSelectedDate(null); setSelectedTime(""); };

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) setShowPopup(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCalendarModal(false);
        setShowFormView(false);
      }
    };
    if (showCalendarModal) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendarModal]);

  useEffect(() => {
    if (showCalendarModal && showFormView) {
      setTimeout(() => {
        const addGuestBtn = document.getElementById('addGuestBtn');
        if (addGuestBtn) {
          addGuestBtn.onclick = () => {
            const guestEmail = (document.getElementById('guestEmail') as HTMLInputElement)?.value;
            if (!guestEmail) { alert("Masukkan email guest terlebih dahulu!"); return; }
            const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
            if (!emailRegex.test(guestEmail)) { alert("Format email guest tidak valid!"); return; }
            const guestList = document.getElementById('guestList');
            if (guestList && guestList.children.length >= 3) { alert("Maksimal 3 guest!"); return; }
            const guestItem = document.createElement('div');
            guestItem.className = 'guest-item';
            guestItem.setAttribute('data-email', guestEmail);
            guestItem.style.cssText = 'display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background-color: #f0f0f0; border-radius: 60px; font-size: 12px;';
            guestItem.innerHTML = `<span>${guestEmail}</span><button class="remove-guest" style="background: none; border: none; cursor: pointer; color: #ff4444; font-size: 16px;">×</button>`;
            guestItem.querySelector('.remove-guest')?.addEventListener('click', () => guestItem.remove());
            guestList?.appendChild(guestItem);
            (document.getElementById('guestEmail') as HTMLInputElement).value = '';
          };
        }
      }, 100);
    }
  }, [showCalendarModal, showFormView]);

  // Format helpers
  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const todayDate = new Date();
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === todayDate.toDateString()) return "Hari ini";
    if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getDateParts = (dateString: string) => {
    const date = new Date(dateString);
    return { day: date.getDate(), month: date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase(), year: date.getFullYear() };
  };

  // Display data
  const displayCommunities = communities.length > 0 ? communities : defaultCommunities.map((c, idx) => ({ ...c, id: idx.toString(), members: [], memberCount: 0 }));

  // Loading animation
  useEffect(() => {
    if (!isLoading || !loadingOverlayRef.current) return;
    const loadingTimeline = gsap.timeline({
      onComplete: () => {
        gsap.to(loadingOverlayRef.current, {
          x: '-100%', duration: 1, ease: "power3.inOut",
          onComplete: () => {
            setIsLoading(false);
            gsap.fromTo(mainContentRef.current, { x: '100%', opacity: 0.5 }, { x: '0%', opacity: 1, duration: 1, ease: "power3.inOut" });
            if (menuruTopMainRef.current) { gsap.set(menuruTopMainRef.current, { x: -500, opacity: 0 }); gsap.to(menuruTopMainRef.current, { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.1 }); }
            if (studioTextRef.current) { gsap.set(studioTextRef.current, { opacity: 0, y: 50 }); gsap.to(studioTextRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.3 }); }
            if (bottomLeftTextRef.current) { gsap.set(bottomLeftTextRef.current, { opacity: 0, y: 50 }); gsap.to(bottomLeftTextRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.45 }); }
            if (bottomContentRef.current) { gsap.fromTo(bottomContentRef.current, { opacity: 0, y: 50, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: "power3.out", delay: 0.5 }); }
          }
        });
      }
    });
    return () => { loadingTimeline.kill(); };
  }, [isLoading]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');
        @font-face { font-family: 'Aeonik-Regular'; src: url('/fonts/Aeonik-Regular.woff2') format('woff2'), url('/fonts/Aeonik-Regular.woff') format('woff'); font-weight: 400; font-style: normal; font-display: swap; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
        html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background-color: white; }
        #smooth-wrapper { position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; }
        #smooth-content { min-height: 100vh; width: 100%; will-change: transform; }
        .studio-text { font-family: 'HelveticaNowDisplay', 'Arial', sans-serif; font-weight: 400; font-size: 80px; color: rgb(16, 16, 16); letter-spacing: -0.02em; line-height: 1.2; cursor: pointer; transition: opacity 0.3s ease; }
        .studio-text:hover { opacity: 0.8; }
        .studio-hover-images { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 150; }
        .floating-img-studio { position: absolute; width: 400px; height: 500px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3); opacity: 0; background-color: #f5f5f5; }
        .bottom-left-text { font-family: 'HelveticaNowDisplay', 'Arial', sans-serif; font-weight: 400; font-size: 40px; color: rgb(16, 16, 16); letter-spacing: -0.02em; line-height: 1.3; }
        .features-section { min-height: 25vh; width: 100%; display: flex; flex-direction: column; justify-content: space-between; transition: background-color 0.3s ease; position: relative; z-index: 5; padding: 40px 80px 40px 80px; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.15); }
        .features-title { font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif; font-weight: 400; font-size: 300px; letter-spacing: -0.02em; line-height: 1; margin: 0; transition: color 0.3s ease; }
        .features-bottom { width: 100%; display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 10; }
        .features-left-number { font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif; font-weight: 400; font-size: 150px; letter-spacing: -0.02em; line-height: 1; margin: 0; transition: color 0.2s ease; }
        .hover-container { position: relative; cursor: pointer; z-index: 20; display: flex; align-items: center; gap: 25px; }
        .features-right-text { font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif; font-weight: 400; font-size: 150px; letter-spacing: -0.02em; line-height: 1; margin: 0; transition: color 0.2s ease; display: inline-block; z-index: 2; position: relative; }
        .update-container { opacity: 0; transform: translateX(50px); transition: opacity 0.2s ease, transform 0.2s ease; display: flex; align-items: center; justify-content: center; z-index: 2; position: relative; }
        .update-number { font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif; font-size: 70px; font-weight: 400; line-height: 1; transition: color 0.2s ease; }
        .features-right-arrow { display: inline-flex; align-items: center; justify-content: center; transition: transform 0.2s ease; z-index: 2; position: relative; }
        .features-right-arrow svg { width: 50px; height: 50px; stroke: currentColor; transition: stroke 0.2s ease, transform 0.2s ease; }
        .circle-images-container { opacity: 0; transform: translateX(20px); transition: opacity 0.2s ease, transform 0.2s ease; display: flex; align-items: center; gap: 10px; margin-left: 10px; z-index: 2; position: relative; }
        .circle-img { width: 50px; height: 50px; border-radius: 50%; overflow: hidden; position: relative; transition: transform 0.2s ease; border: 2px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .features-overlay { position: absolute; top: -20px; left: -100vw; right: -200px; bottom: -20px; background-color: #000000; opacity: 0; pointer-events: none; z-index: 1; border-radius: 0px; transition: opacity 0.2s ease; width: calc(100% + 100vw + 200px); }
        .hover-container:hover .features-overlay { opacity: 1; }
        .hover-container:hover .update-container { opacity: 1; transform: translateX(0); }
        .hover-container:hover .circle-images-container { opacity: 1; transform: translateX(0); }
        .trusted-section { min-height: 100vh; width: 100%; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; transition: background-color 0.3s ease; position: relative; z-index: 5; padding-left: 80px; padding-top: 80px; padding-bottom: 80px; box-sizing: border-box; overflow-x: hidden; }
        .trusted-text { font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif; font-weight: 400; font-size: 150px; color: rgb(21, 22, 26); letter-spacing: -0.02em; line-height: 1.2; text-align: left; margin: 0; transition: color 0.3s ease; margin-bottom: 60px; }
        .carousel-container { width: 100%; overflow-x: auto; overflow-y: hidden; cursor: grab; scroll-behavior: smooth; padding-bottom: 40px; }
        .carousel-container:active { cursor: grabbing; }
        .carousel-track { display: flex; gap: 30px; padding-right: 80px; }
        .carousel-item { flex-shrink: 0; width: 380px; background: transparent; border-radius: 24px; transition: all 0.3s ease; }
        .carousel-item:hover { transform: translateY(-10px); }
        .carousel-image { width: 100%; height: 380px; border-radius: 20px; overflow: hidden; position: relative; margin-bottom: 20px; }
        .carousel-brand { font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif; font-weight: 500; font-size: 24px; margin: 0 0 8px 0; transition: color 0.3s ease; letter-spacing: -0.02em; }
        .carousel-desc { font-family: 'Questrial', sans-serif; font-weight: 400; font-size: 14px; line-height: 1.5; transition: color 0.3s ease; opacity: 0.8; }
        .calendar-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: modalFadeIn 0.3s ease; }
        .calendar-modal { background-color: #ffffff; border-radius: 32px; width: 90%; max-width: 1400px; max-height: 85vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalFadeIn 0.3s ease; }
        .calendar-day { transition: all 0.2s ease; cursor: pointer; border-radius: 12px; }
        .calendar-day:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
        .time-slot { transition: all 0.2s ease; cursor: pointer; border-radius: 8px; }
        .time-slot:hover { transform: scale(1.02); background-color: #f0f0f0 !important; }
        .call-farid-text { font-family: 'HelveticaNowDisplay', 'Arial', sans-serif; font-weight: 400; font-size: 60px; line-height: 66px; color: rgb(16, 16, 16); text-align: left; }
        .email-text { font-family: 'HelveticaNowDisplay', 'Arial', sans-serif; font-weight: 400; font-size: 32px; color: rgb(16, 16, 16); letter-spacing: 0.02em; }
        .badge-founder { display: inline-flex; align-items: center; padding: 10px 28px; background-color: #000000; border-radius: 60px; font-family: 'Questrial', sans-serif; font-size: 30px; font-weight: 500; color: #ffffff; border: 1px solid #333333; }
        .calendar-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background-color: #c5e800; border: none; border-radius: 60px; cursor: pointer; font-family: 'Questrial', sans-serif; font-size: 20px; font-weight: 600; color: #000000; transition: all 0.3s ease; white-space: nowrap; }
        .calendar-btn:hover { background-color: #b0d100; transform: scale(1.02); }
        .email-wrapper { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: opacity 0.3s ease; }
        .email-wrapper:hover { opacity: 0.7; }
        .chat-messages::-webkit-scrollbar { width: 6px; display: block; }
        .chat-messages::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
        .contact-btn-effect { position: relative; isolation: isolate; transition: all 0.3s ease; background-color: #ffffff !important; color: #000000 !important; border: 1.5px solid #cccccc !important; }
        .contact-btn-effect::before { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; background-color: #000000; transition: height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1); z-index: -1; border-radius: 60px; }
        .contact-btn-effect:hover::before { height: 100%; }
        .contact-btn-effect:hover { color: #ffffff !important; border-color: #333333 !important; }
        .contact-btn-effect .dot-small { background-color: #000000 !important; }
        .contact-btn-effect:hover .dot-small { opacity: 0 !important; transform: scale(0) !important; }
        .circle-large-white { background-color: #000000 !important; }
        .circle-large-white svg path { stroke: #ffffff !important; }
        .contact-btn-effect:hover .circle-large-white { background-color: #ffffff !important; opacity: 1 !important; transform: scale(1) !important; }
        .contact-btn-effect:hover .circle-large-white svg path { stroke: #000000 !important; }
        .social-item { transition: all 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .photo-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.9); z-index: 20002; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .comment-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); z-index: 20003; display: flex; align-items: center; justify-content: center; }
      `}</style>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div ref={loadingOverlayRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000000', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div style={{ position: 'absolute', top: '10px', left: '40px', fontFamily: 'Inter, "Helvetica Neue", sans-serif', fontWeight: '400', fontSize: '219px', lineHeight: '219px', color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>MENURU</div>
          <div style={{ position: 'absolute', top: '50%', right: '60px', transform: 'translateY(-50%)', fontFamily: 'Inter, "Helvetica Neue", sans-serif', fontWeight: '400', fontSize: '219px', lineHeight: '219px', color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'right' }}>BRAND</div>
          <div style={{ position: 'absolute', bottom: '40px', right: '60px', fontFamily: 'Inter, "Helvetica Neue", sans-serif', fontWeight: '400', fontSize: '219px', lineHeight: '219px', color: '#ffffff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>2026</div>
        </div>
      )}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div ref={mainContentRef} style={{ minHeight: '100vh', backgroundColor: 'white', margin: 0, padding: 0, width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Questrial, sans-serif', position: 'relative', opacity: isLoading ? 0 : 1, transform: isLoading ? 'translateX(100%)' : 'translateX(0)', transition: 'all 0.01s ease' }}>

            {/* HEADER SECTION - MENURU */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, pointerEvents: 'none', padding: '20px 0 0 40px' }}>
              <div ref={menuruTopMainRef} style={{ fontFamily: 'Inter, "Helvetica Neue", sans-serif', fontWeight: '400', fontSize: '213px', lineHeight: '213px', color: '#000000', letterSpacing: '-0.02em', textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: 0, transform: 'translateX(-500px)' }}>MENURU</div>
            </div>

            {/* SECTION 1 - MENURU.STUDIO */}
            <div ref={studioContainerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minHeight: '100vh', paddingRight: '80px', position: 'relative' }}>
              <div ref={studioTextRef} className="studio-text" style={{ textAlign: 'right', opacity: 0 }} onMouseEnter={handleStudioHoverEnter} onMouseLeave={handleStudioHoverLeave}>
                <div>MENURU.STUDIO – Jakarta UX/UI Design</div>
                <div>Personal for Note, Donation & Calendar</div>
              </div>
              <div ref={bottomLeftTextRef} className="bottom-left-text" style={{ position: 'absolute', bottom: '5%', left: '80px', textAlign: 'left', opacity: 0 }}>IDN<br />MN'RU© - 26'</div>
              <div className="studio-hover-images">
                <div ref={img1Ref} className="floating-img-studio" style={{ left: '0%', top: '50%', transform: 'translateY(-50%)' }}><Image src="/images/lkhh.jpg" alt="Gallery 1" fill style={{ objectFit: 'cover' }} /></div>
                <div ref={img2Ref} className="floating-img-studio" style={{ right: '0%', top: '50%', transform: 'translateY(-50%)' }}><Image src="/images/ai.jpg" alt="Gallery 2" fill style={{ objectFit: 'cover' }} /></div>
              </div>
            </div>

            {/* FEATURES SECTION */}
            <div ref={featuresSectionRef} className="features-section" style={{ backgroundColor: featuresBgColor }}>
              <div className="features-top"><div ref={featuresTitleRef} className="features-title" style={{ color: featuresTextColor }}>Features</div></div>
              <div className="features-bottom">
                <div ref={featuresLeftNumberRef} className="features-left-number" style={{ color: featuresTextColor }}>01</div>
                <div ref={hoverContainerRef} className="hover-container" onMouseEnter={handleNoteHoverEnter} onMouseLeave={handleNoteHoverLeave}>
                  <div ref={featuresRightTextRef} className="features-right-text" style={{ color: featuresTextColor }}>Note</div>
                  <div ref={updateContainerRef} className="update-container"><div className="update-number" style={{ color: featuresTextColor }}>Update<sup>¹</sup></div></div>
                  <div ref={featuresArrowRef} className="features-right-arrow">{noteHover ? <svg width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> : <NorthEastArrowIcon size={50} />}</div>
                  <div ref={circleImagesRef} className="circle-images-container"><div ref={circleImg1Ref} className="circle-img"><Image src="/images/lkhh.jpg" alt="circle 1" fill style={{ objectFit: 'cover' }} /></div><div ref={circleImg2Ref} className="circle-img"><Image src="/images/ai.jpg" alt="circle 2" fill style={{ objectFit: 'cover' }} /></div></div>
                  <div ref={featuresOverlayRef} className="features-overlay" />
                </div>
              </div>
            </div>

            <div ref={featuresSection2Ref} className="features-section" style={{ backgroundColor: featuresBgColor }}>
              <div className="features-bottom">
                <div ref={featuresLeftNumber2Ref} className="features-left-number" style={{ color: featuresTextColor }}>02</div>
                <div ref={hoverContainer2Ref} className="hover-container" onMouseEnter={handleCommunityHoverEnter} onMouseLeave={handleCommunityHoverLeave}>
                  <div ref={featuresRightText2Ref} className="features-right-text" style={{ color: featuresTextColor }}>Community</div>
                  <div ref={updateContainer2Ref} className="update-container"><div className="update-number" style={{ color: featuresTextColor }}>Join<sup>²</sup></div></div>
                  <div ref={featuresArrow2Ref} className="features-right-arrow">{communityHover ? <svg width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> : <NorthEastArrowIcon size={50} />}</div>
                  <div ref={circleImages2Ref} className="circle-images-container"><div ref={circleImg1_2Ref} className="circle-img"><Image src="/images/ai.jpg" alt="circle 1" fill style={{ objectFit: 'cover' }} /></div><div ref={circleImg2_2Ref} className="circle-img"><Image src="/images/lkhh.jpg" alt="circle 2" fill style={{ objectFit: 'cover' }} /></div></div>
                  <div ref={featuresOverlay2Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            <div ref={featuresSection3Ref} className="features-section" style={{ backgroundColor: featuresBgColor }}>
              <div className="features-bottom">
                <div ref={featuresLeftNumber3Ref} className="features-left-number" style={{ color: featuresTextColor }}>03</div>
                <div ref={hoverContainer3Ref} className="hover-container" onMouseEnter={handleCalendarHoverEnter} onMouseLeave={handleCalendarHoverLeave}>
                  <div ref={featuresRightText3Ref} className="features-right-text" style={{ color: featuresTextColor }}>Calendar</div>
                  <div ref={updateContainer3Ref} className="update-container"><div className="update-number" style={{ color: featuresTextColor }}>Schedule<sup>³</sup></div></div>
                  <div ref={featuresArrow3Ref} className="features-right-arrow">{calendarHover ? <svg width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> : <NorthEastArrowIcon size={50} />}</div>
                  <div ref={circleImages3Ref} className="circle-images-container"><div ref={circleImg1_3Ref} className="circle-img"><Image src="/images/5.jpg" alt="circle 1" fill style={{ objectFit: 'cover' }} /></div><div ref={circleImg2_3Ref} className="circle-img"><Image src="/images/lkhh.jpg" alt="circle 2" fill style={{ objectFit: 'cover' }} /></div></div>
                  <div ref={featuresOverlay3Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            <div ref={featuresSection4Ref} className="features-section" style={{ backgroundColor: featuresBgColor }}>
              <div className="features-bottom">
                <div ref={featuresLeftNumber4Ref} className="features-left-number" style={{ color: featuresTextColor }}>04</div>
                <div ref={hoverContainer4Ref} className="hover-container" onMouseEnter={handleBlogHoverEnter} onMouseLeave={handleBlogHoverLeave}>
                  <div ref={featuresRightText4Ref} className="features-right-text" style={{ color: featuresTextColor }}>Blog</div>
                  <div ref={updateContainer4Ref} className="update-container"><div className="update-number" style={{ color: featuresTextColor }}>Read<sup>⁴</sup></div></div>
                  <div ref={featuresArrow4Ref} className="features-right-arrow">{blogHover ? <svg width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> : <NorthEastArrowIcon size={50} />}</div>
                  <div ref={circleImages4Ref} className="circle-images-container"><div ref={circleImg1_4Ref} className="circle-img"><Image src="/images/ai.jpg" alt="circle 1" fill style={{ objectFit: 'cover' }} /></div><div ref={circleImg2_4Ref} className="circle-img"><Image src="/images/5.jpg" alt="circle 2" fill style={{ objectFit: 'cover' }} /></div></div>
                  <div ref={featuresOverlay4Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            <div ref={featuresSection5Ref} className="features-section" style={{ backgroundColor: featuresBgColor }}>
              <div className="features-bottom">
                <div ref={featuresLeftNumber5Ref} className="features-left-number" style={{ color: featuresTextColor }}>05</div>
                <div ref={hoverContainer5Ref} className="hover-container" onMouseEnter={handleDonationHoverEnter} onMouseLeave={handleDonationHoverLeave}>
                  <div ref={featuresRightText5Ref} className="features-right-text" style={{ color: featuresTextColor }}>Donation</div>
                  <div ref={updateContainer5Ref} className="update-container"><div className="update-number" style={{ color: featuresTextColor }}>Support<sup>⁵</sup></div></div>
                  <div ref={featuresArrow5Ref} className="features-right-arrow">{donationHover ? <svg width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> : <NorthEastArrowIcon size={50} />}</div>
                  <div ref={circleImages5Ref} className="circle-images-container"><div ref={circleImg1_5Ref} className="circle-img"><Image src="/images/lkhh.jpg" alt="circle 1" fill style={{ objectFit: 'cover' }} /></div><div ref={circleImg2_5Ref} className="circle-img"><Image src="/images/ai.jpg" alt="circle 2" fill style={{ objectFit: 'cover' }} /></div></div>
                  <div ref={featuresOverlay5Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            {/* COMMUNITY SECTION */}
            {!isLoading && (
              <div ref={cardsSectionRef} style={{ width: '100%', minHeight: '100vh', position: 'relative', backgroundColor: '#a2ea13', marginBottom: 0, transition: 'background-color 0.3s ease' }}>
                <div style={{ position: 'relative', zIndex: 20, width: '100%', backgroundColor: '#a2ea13', padding: '80px 80px 0 80px', boxSizing: 'border-box', transition: 'background-color 0.3s ease' }} id="community-title-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '30px' }}>
                      <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '260px', fontWeight: '400', letterSpacing: '-0.02em', lineHeight: '0.9', color: '#000000', textTransform: 'uppercase' }} id="community-title">COMMUNITY</div>
                      <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '100px', fontWeight: '400', color: '#000000', lineHeight: '0.9' }}>({displayCommunities.length})</div>
                    </div>
                    <div style={{ marginBottom: '40px' }} id="community-arrow"><svg width="100" height="100" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  </div>
                </div>
                <div style={{ padding: '60px 80px 80px 80px', backgroundColor: '#a2ea13', transition: 'background-color 0.3s ease' }}>
                  {displayCommunities.map((community, idx) => {
                    const isOpen = openCommunityId === community.id;
                    const memberNames = community.members?.map(m => m.userName) || [];
                    return (
                      <div key={community.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 0', borderBottom: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }} onClick={() => setOpenCommunityId(isOpen ? null : community.id)}>
                          <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '90px', fontWeight: '400', color: '#000000', letterSpacing: '-0.02em', lineHeight: '1', width: '150px' }}>{String(idx + 1).padStart(2, '0')}</div>
                          <div style={{ flex: 1, paddingLeft: '40px', display: 'flex', alignItems: 'center', gap: '30px' }}>
                            <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '90px', fontWeight: '400', color: '#000000', letterSpacing: '-0.02em', lineHeight: '1', textAlign: 'left' }}>{community.name}</div>
                            <Link href={community.link || `/community/${community.name.toLowerCase()}`}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'opacity 0.2s' }} onClick={(e) => e.stopPropagation()} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                                <span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '30px', color: '#000000' }}>Kunjungi</span><NorthEastArrowIcon size={36} />
                              </div>
                            </Link>
                          </div>
                          <div style={{ width: '150px', display: 'flex', justifyContent: 'flex-end', transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            <svg width="90" height="90" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                        {isOpen && (
                          <div style={{ padding: '40px 0 60px 190px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '50px', fontWeight: '400', color: '#000000', letterSpacing: '-0.01em', lineHeight: '1.3', marginBottom: '50px' }}>{community.description}</div>
                            <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '30px', fontWeight: '400', color: '#000000', marginBottom: '30px' }}>MEMBERS ({memberNames.length})</div>
                            {memberNames.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
                                {memberNames.map((name, memberIdx) => (
                                  <div key={memberIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 24px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '60px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '20px', fontWeight: '500' }}>{name.charAt(0).toUpperCase()}</div>
                                    <span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '24px', color: '#000000' }}>{name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '24px', color: '#999999', padding: '40px 0', textAlign: 'center' }}>Belum ada member yang bergabung. Jadilah yang pertama!</div>
                            )}
                            {user ? (
                              <button onClick={() => joinCommunity(community.id, community.name)} style={{ marginTop: '20px', padding: '14px 32px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '60px', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '20px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '12px', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>JOIN COMMUNITY<NorthEastArrowIcon size={20} /></button>
                            ) : (
                              <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '16px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '20px', color: '#666666' }}>Silakan login terlebih dahulu untuk bergabung ke komunitas</span>
                                <button onClick={() => setShowAuthModal(true)} style={{ padding: '8px 24px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '60px', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '16px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>LOGIN<NorthEastArrowIcon size={16} /></button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DONATUR SECTION - AWARDS MINIMALIST STYLE */}
            {!isLoading && donation && (
              <div style={{ width: '100%', position: 'relative', backgroundColor: '#ffffff', padding: '120px 80px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '300px', fontWeight: '400', color: '#000000', letterSpacing: '-0.02em', lineHeight: '0.9', textTransform: 'uppercase' }}>DONATUR</div>
                    <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '100px', fontWeight: '400', color: '#000000', lineHeight: '0.9' }}>(1)</div>
                  </div>
                  <div style={{ marginBottom: '20px' }}><svg width="100" height="100" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '90px', fontWeight: '400', color: '#000000', letterSpacing: '-0.02em', lineHeight: '1', marginBottom: '50px' }}>01</div>
                  <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '50px', fontWeight: '400', color: '#000000', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '40px' }}>{donation.orphanageName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '30px', fontWeight: '400', color: '#000000', letterSpacing: '-0.01em' }}>{donation.date instanceof Date ? donation.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "23 Mei 2026"}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '30px', fontWeight: '400', color: '#000000', letterSpacing: '-0.01em' }}>{donation.donorName}</span><VerifiedBadge size={28} /></div>
                  </div>
                  <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '24px', fontWeight: '400', color: '#333333', letterSpacing: '-0.01em', lineHeight: '1.5', marginBottom: '70px', maxWidth: '80%' }}>{donation.message}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
                    {(donation.photos || ["/images/lkhh.jpg", "/images/ai.jpg", "/images/5.jpg", "/images/lkhh.jpg"]).map((photo, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden', backgroundColor: '#f0f0f0', cursor: 'pointer', transition: 'transform 0.3s ease' }} onClick={() => setSelectedPhotoIndex(idx)} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                          <Image src={photo} alt={`Donation photo ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <button onClick={() => { setCurrentCommentPhotoIndex(idx); setShowCommentModal(true); }} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '60px', transition: 'background-color 0.2s', fontSize: '14px', color: '#666666', fontFamily: "'Questrial', sans-serif" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
                            <span>{photoComments[idx]?.length || 0} komentar</span>
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#999999', fontFamily: "'Questrial', sans-serif" }}><span>Foto oleh: {donation.donorName}</span><VerifiedBadge size={14} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TRUSTED COLLABS SECTION */}
            <div ref={trustedSectionRef} className="trusted-section" style={{ backgroundColor: '#ffffff' }}>
              <div ref={trustedTextRef} className="trusted-text">TRUSTED COLLABS</div>
              <div ref={carouselRef} className="carousel-container"><div className="carousel-track">{carouselItems.map((item) => (<div key={item.id} className="carousel-item"><div className="carousel-image"><Image src={item.image} alt={item.brand} fill style={{ objectFit: 'cover' }} /></div><h3 className="carousel-brand" style={{ color: 'rgb(21, 22, 26)' }}>{item.brand}</h3><p className="carousel-desc" style={{ color: 'rgb(21, 22, 26)' }}>{item.description}</p></div>))}</div></div>
            </div>

            {/* CALENDAR SUBMISSIONS SECTION */}
            {calendarSubmissions.length > 0 && (
              <div style={{ width: '100%', padding: '120px 80px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '190px', fontWeight: '400', color: '#000000', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '100px', lineHeight: '1' }}>
                  <span>MEETING SCHEDULE</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}><span style={{ fontSize: '100px', color: '#000000', fontWeight: '400' }}>({calendarSubmissions.length})</span><svg width="100" height="100" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
                  {calendarSubmissions.map((submission) => {
                    const dateParts = getDateParts(submission.selectedDate);
                    return (
                      <div key={submission.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '80px' }}>
                        <div style={{ width: '200px', flexShrink: 0, textAlign: 'left' }}>
                          <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '100px', fontWeight: '400', color: '#000000', lineHeight: '1', letterSpacing: '-0.02em' }}>{dateParts.day}</div>
                          <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '40px', fontWeight: '400', color: '#000000', letterSpacing: '-0.02em', marginTop: '12px' }}>{dateParts.month}</div>
                          <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '24px', fontWeight: '400', color: '#666666', marginTop: '8px' }}>{dateParts.year}</div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
                            <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '48px', fontWeight: '400', color: '#000000', letterSpacing: '-0.02em' }}>{submission.fullName}</div>
                            <div style={{ fontSize: '20px', padding: '6px 24px', border: '1px solid #000000', backgroundColor: 'transparent', color: '#000000', fontWeight: '400', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", letterSpacing: '0.02em' }}>{submission.status === 'pending' ? 'PENDING' : submission.status === 'confirmed' ? 'CONFIRMED' : submission.status === 'completed' ? 'COMPLETED' : 'REJECTED'}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1.5"/><polyline points="12 6 12 12 16 14" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '28px', color: '#000000' }}>{submission.selectedTime} WIB</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#000000" strokeWidth="1.5"/><line x1="8" y1="2" x2="8" y2="6" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/><line x1="16" y1="2" x2="16" y2="6" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/></svg><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '28px', color: '#000000' }}>{submission.meetingType}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#000000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '28px', color: '#000000' }}>{submission.platform === 'google_meet' ? 'Google Meet' : submission.platform === 'zoom' ? 'Zoom' : submission.platform === 'tatap_muka' ? 'Offline' : 'Via HP'}</span></div>
                          </div>
                          <div><div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '20px', fontWeight: '400', color: '#999999', marginBottom: '20px', letterSpacing: '0.05em' }}>REASON TO TRUST</div><div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '32px', fontWeight: '400', color: '#000000', lineHeight: '1.4', letterSpacing: '-0.01em' }}>"{submission.trustReason}"</div></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '48px', flexWrap: 'wrap', marginTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" stroke="#000000" strokeWidth="1.5"/><polyline points="22 7 12 13 2 7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '22px', color: '#000000' }}>{submission.email}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#000000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '22px', color: '#000000' }}>{submission.phoneNumber}</span></div>
                            {submission.companyName && (<div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke="#000000" strokeWidth="1.5"/><line x1="9" y1="4" x2="9" y2="20" stroke="#000000" strokeWidth="1.5"/><line x1="15" y1="4" x2="15" y2="20" stroke="#000000" strokeWidth="1.5"/><line x1="4" y1="9" x2="20" y2="9" stroke="#000000" strokeWidth="1.5"/><line x1="4" y1="15" x2="20" y2="15" stroke="#000000" strokeWidth="1.5"/></svg><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '22px', color: '#000000' }}>{submission.companyName}</span></div>)}
                          </div>
                          {submission.adminReply && (<div style={{ marginTop: '24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#000000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '18px', fontWeight: '400', color: '#999999', letterSpacing: '0.05em' }}>ADMIN REPLY · {submission.adminReply.repliedBy}</span></div><div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '24px', color: '#000000', lineHeight: '1.4', paddingLeft: '38px' }}>{submission.adminReply.text}</div></div>)}
                        </div>
                        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '24px' }}>
                          <button onClick={() => { setShowCalendarModal(true); setShowFormView(false); setSelectedDate(null); setSelectedTime(""); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', backgroundColor: 'transparent', border: '1px solid #000000', cursor: 'pointer', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '20px', fontWeight: '400', color: '#000000', padding: '16px 28px', borderRadius: '0', width: '100%' }}>BOOK CALL<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                          {isAdmin && (<button onClick={() => { setSelectedSubmission(submission); setReplyText(submission.adminReply?.text || ""); setReplyStatus(submission.status); setShowReplyModal(true); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', backgroundColor: 'transparent', border: '1px solid #000000', cursor: 'pointer', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '18px', fontWeight: '400', color: '#000000', padding: '14px 24px', borderRadius: '0', width: '100%' }}>{submission.adminReply ? 'EDIT REPLY' : 'REPLY'}<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 7L7 17M7 17H17M7 17V7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FOOTER SECTION */}
            <div style={{ width: '100%', position: 'relative', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', minHeight: '60vh' }}>
              <div ref={bottomContentRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '40px', marginBottom: '80px', paddingLeft: '80px', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div ref={mencatatTextRef} style={{ fontSize: '64px', fontFamily: 'Questrial, sans-serif', color: 'black', textAlign: 'left', fontWeight: '400', letterSpacing: '-0.02em', lineHeight: '1.2', whiteSpace: 'nowrap' }}>Mencatat apa yang kamu inginkan</div><span style={{ fontSize: '80px', color: 'black', fontWeight: '400', lineHeight: '1' }}>.</span></div>
                <Link href="/contact"><button ref={contactBtnRef} onClick={handleContact} className="contact-btn-effect" style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', padding: '14px 36px', borderRadius: '60px', cursor: 'pointer', fontSize: '20px', fontWeight: '600', letterSpacing: '-0.01em', fontFamily: 'Questrial, sans-serif', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden', zIndex: 1, border: '1.5px solid #cccccc', backgroundColor: '#ffffff', color: '#000000' }}><span ref={contactTextRef}>Contact</span><div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="dot-small" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000', opacity: 1, transform: 'scale(1)', transition: 'opacity 0.3s ease, transform 0.3s ease', position: 'absolute' }}></div><div className="circle-large-white" style={{ position: 'absolute', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transform: 'scale(0.8)', transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div></button></Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap', width: '100%' }}><div ref={callTextRef} className="call-farid-text"><div>Ready to surpass your</div><div>wildest dreams?</div><div>Call Farid.</div></div><button ref={calendarBtnRef} onClick={handleCalendarCall} className="calendar-btn"><ArrowIcon size={24} />Calendar call</button></div>
                <div ref={profileRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '24px', width: '100%', marginTop: '10px' }}><div style={{ width: '80px', height: '100px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '2px solid #e0e0e0' }}><Image src="/images/5.jpg" alt="Farid Ardiansyah" fill style={{ objectFit: 'cover', objectPosition: 'center' }} /></div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '40px', fontWeight: '400', color: 'rgb(16, 16, 16)', letterSpacing: '-0.02em' }}>Farid Ardiansyah</div><div className="badge-founder">Founder & Programmer</div></div>
              </div>
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 80px', marginBottom: '30px', boxSizing: 'border-box' }}>
                <div ref={emailRef} onClick={handleEmailClick} className="email-wrapper" style={{ marginBottom: '20px' }}><ArrowIcon size={24} /><span className="email-text">contact.menuru@gmail.com</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'absolute', left: '50%', transform: 'translateX(-50%)', marginBottom: '20px' }}>
                  <div className="social-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={(e) => { const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement; if (textElement) handleSocialHover(textElement, originalTexts.ig); }} onMouseLeave={(e) => { const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement; if (textElement) handleSocialLeave(textElement, originalTexts.ig); }} onClick={() => handleSocialClick('Instagram')}><span ref={igRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>Instagram</span></div>
                  <div className="social-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={(e) => { const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement; if (textElement) handleSocialHover(textElement, originalTexts.x); }} onMouseLeave={(e) => { const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement; if (textElement) handleSocialLeave(textElement, originalTexts.x); }} onClick={() => handleSocialClick('X')}><span ref={xRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>X</span></div>
                  <div className="social-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={(e) => { const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement; if (textElement) handleSocialHover(textElement, originalTexts.linkedin); }} onMouseLeave={(e) => { const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement; if (textElement) handleSocialLeave(textElement, originalTexts.linkedin); }} onClick={() => handleSocialClick('LinkedIn')}><span ref={linkedinRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>LinkedIn</span></div>
                </div>
              </div>
              <footer style={{ position: 'relative', bottom: 0, left: 0, right: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '0 80px 0 0', margin: 0, pointerEvents: 'none', zIndex: 1, marginTop: '40px' }}>
                <span ref={menuruTextRef} style={{ fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif", fontWeight: 'normal', fontSize: '600px', color: '#000000', textAlign: 'right', letterSpacing: '-0.02em', opacity: 1, textTransform: 'uppercase', lineHeight: '0.7', whiteSpace: 'nowrap' }}>MENURU</span>
              </footer>
            </div>

          </div>
        </div>
      </div>

      {/* SHADOW PAGE */}
      <div ref={shadowPageRef} style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '100vh', backgroundColor: '#000000', zIndex: 9998, transform: 'translateY(100%)', pointerEvents: showShadowPage ? 'auto' : 'none', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '80px', left: '80px', width: 'auto', textAlign: 'left', pointerEvents: 'none', zIndex: 1 }}><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300', fontSize: '300px', color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '0.9', opacity: 0.9 }}>MENURU</span></div>
          {!isChatVisible && (<button onClick={() => setIsChatVisible(true)} style={{ position: 'absolute', bottom: '120px', right: '80px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '16px 32px', zIndex: 10, transition: 'opacity 0.3s ease', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '20px', color: '#ffffff', letterSpacing: '-0.02em' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><span>BUKA CHAT</span><NorthEastArrowIcon size={24} /></button>)}
          <div style={{ position: 'absolute', top: '80px', left: '80px', color: '#ffffff', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", zIndex: 5 }}><div style={{ fontSize: '150px', fontWeight: '300', margin: 0, letterSpacing: '-0.02em', lineHeight: '1' }}>LET'S</div><div style={{ fontSize: '150px', fontWeight: '300', margin: 0, letterSpacing: '-0.02em', lineHeight: '1' }}>TALK</div></div>
          {isChatVisible && (
            <div style={{ position: 'absolute', bottom: '80px', right: '80px', width: '600px', height: '650px', backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 20, border: 'none' }}>
              <div style={{ padding: '24px 28px', backgroundColor: 'transparent', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", color: '#ffffff', fontWeight: '300', fontSize: '28px', letterSpacing: '-0.02em' }}>CHAT</span><span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: '300' }}>{user ? (isAdmin ? 'ADMIN' : user.displayName || user.email?.split('@')[0]) : 'BELUM LOGIN'}</span></div>
                <div style={{ display: 'flex', gap: '20px' }}>{user && (<button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '16px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", padding: '4px 8px', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><span>LOGOUT</span><NorthEastArrowIcon size={16} /></button>)}<button onClick={() => setIsChatVisible(false)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '28px', padding: '0 4px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif" }}>✕</button></div>
              </div>
              {replyTo && (<div style={{ padding: '12px 24px', backgroundColor: 'transparent', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", color: 'rgba(255,255,255,0.6)' }}><span>REPLY KE: <span style={{ color: '#ffffff' }}>{replyTo.name}</span> - "{replyTo.text.substring(0, 50)}..."</span><button onClick={cancelReply} style={{ backgroundColor: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '20px' }}>✕</button></div>)}
              <div ref={chatContainerRef} className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {messages.length === 0 && (<div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '80px 20px', fontSize: '18px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300' }}>BELUM ADA PESAN</div>)}
                {messages.map((msg) => {
                  const isOwnMessage = user?.uid === msg.userId;
                  const isAdminMessage = msg.isAdmin === true;
                  return (<div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start', maxWidth: '90%', alignSelf: isOwnMessage ? 'flex-end' : 'flex-start' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif" }}><span style={{ color: '#ffffff', fontWeight: '300', fontSize: '15px' }}>{msg.userName}{isAdminMessage && ' [ADMIN]'}</span><span>{msg.timestamp ? formatTime(msg.timestamp) : ''}</span><span style={{ fontSize: '11px' }}>{msg.timestamp ? formatDate(msg.timestamp) : ''}</span>{user && !isOwnMessage && (<button onClick={() => handleReply(msg)} style={{ backgroundColor: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif" }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>REPLY</button>)}</div>{msg.replyTo && (<div style={{ marginBottom: '8px', padding: '8px 12px', backgroundColor: 'transparent', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", maxWidth: '100%' }}>REPLY KE <span style={{ color: '#ffffff' }}>{msg.replyTo.userName}</span>: "{msg.replyTo.text}"</div>)}<div style={{ color: '#ffffff', padding: '14px 20px', fontSize: '16px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300', letterSpacing: '-0.01em', lineHeight: '1.5' }}>{msg.text}</div></div>);
                })}
                <div ref={messagesEndRef} />
              </div>
              {user ? (<div style={{ padding: '20px 28px', borderTop: 'none', display: 'flex', gap: '16px', backgroundColor: 'transparent' }}><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="TULIS PESAN..." style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', padding: '14px 20px', color: '#ffffff', fontSize: '16px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300', outline: 'none' }} /><button onClick={sendMessage} disabled={!newMessage.trim()} style={{ backgroundColor: 'transparent', border: 'none', padding: '10px 28px', color: newMessage.trim() ? '#ffffff' : 'rgba(255,255,255,0.3)', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '16px', fontWeight: '300', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}><span>KIRIM</span><NorthEastArrowIcon size={16} /></button></div>) : (<div style={{ padding: '20px 28px', borderTop: 'none', display: 'flex', justifyContent: 'center' }}><button onClick={() => setShowAuthModal(true)} style={{ backgroundColor: 'transparent', border: 'none', padding: '14px 32px', color: '#ffffff', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '16px', fontWeight: '300', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><span>LOGIN UNTUK CHAT</span><NorthEastArrowIcon size={18} /></button></div>)}
            </div>
          )}
        </div>
      </div>

      {/* REPLY MODAL FOR ADMIN */}
      {showReplyModal && selectedSubmission && (
        <div className="reply-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 20001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '32px', width: '90%', maxWidth: '600px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e0e0e0', paddingBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '28px', fontWeight: '400', color: '#000000', margin: 0, letterSpacing: '-0.02em' }}>REPLY TO MEETING</h2>
              <button onClick={() => { setShowReplyModal(false); setSelectedSubmission(null); setReplyText(""); }} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#000000' }}>✕</button>
            </div>
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '0' }}>
              <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#666666', marginBottom: '8px' }}>FROM: {selectedSubmission.fullName} ({selectedSubmission.email})</div>
              <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#666666', marginBottom: '8px' }}>DATE: {selectedSubmission.selectedDateFormatted} - {selectedSubmission.selectedTime} WIB</div>
              <div style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#000000', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #cccccc' }}>"{selectedSubmission.trustReason}"</div>
            </div>
            <div style={{ marginBottom: '24px' }}><label style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '14px', fontWeight: '400', color: '#000000', display: 'block', marginBottom: '8px' }}>MEETING STATUS</label><select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value as any)} style={{ width: '100%', padding: '12px 16px', borderRadius: '0', border: '1px solid #cccccc', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '14px', backgroundColor: '#ffffff' }}><option value="pending">PENDING</option><option value="confirmed">CONFIRMED</option><option value="completed">COMPLETED</option><option value="rejected">REJECTED</option></select></div>
            <div style={{ marginBottom: '28px' }}><label style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '14px', fontWeight: '400', color: '#000000', display: 'block', marginBottom: '8px' }}>REPLY MESSAGE</label><textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply here..." rows={5} style={{ width: '100%', padding: '12px 16px', borderRadius: '0', border: '1px solid #cccccc', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '14px', resize: 'vertical', backgroundColor: '#ffffff' }} /></div>
            <div style={{ display: 'flex', gap: '16px' }}><button onClick={() => { setShowReplyModal(false); setSelectedSubmission(null); setReplyText(""); }} style={{ flex: 1, padding: '14px', borderRadius: '0', border: '1px solid #000000', backgroundColor: 'transparent', color: '#000000', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '16px', fontWeight: '400', cursor: 'pointer' }}>CANCEL</button><button onClick={handleAdminReply} style={{ flex: 1, padding: '14px', borderRadius: '0', border: '1px solid #000000', backgroundColor: '#000000', color: '#ffffff', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '16px', fontWeight: '400', cursor: 'pointer' }}>SEND REPLY</button></div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#000000', border: 'none', padding: '60px', width: '90%', maxWidth: '550px', color: '#ffffff', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}><div><div style={{ fontSize: '70px', fontWeight: '300', margin: 0, letterSpacing: '-0.02em', lineHeight: '1', color: '#ffffff' }}>{authMode === 'login' ? 'LOGIN' : 'DAFTAR'}</div><div style={{ fontSize: '18px', fontWeight: '300', marginTop: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.01em' }}>{authMode === 'login' ? 'MASUK KE AKUN ANDA' : 'BUAT AKUN BARU'}</div></div><button onClick={() => setShowAuthModal(false)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ffffff', fontSize: '32px', cursor: 'pointer', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif" }}>✕</button></div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexDirection: 'column' }}>
              <button onClick={handleGoogleLogin} style={{ backgroundColor: 'transparent', color: '#ffffff', border: 'none', padding: '18px 28px', fontSize: '18px', fontWeight: '300', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><span>GOOGLE</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/><path d="M15.1 12.5c0-.4-.03-.7-.1-1H12v2h1.8c-.2.5-.6.9-1.1 1.2v1h1.8c1-.9 1.6-2.3 1.6-3.2z" fill="#34A853" fillOpacity="0.7"/><path d="M9.6 14.3c-.3-.5-.5-1.1-.5-1.8s.2-1.3.5-1.8v-1.3H7.8c-.6 1-.9 2-.9 3.1 0 1.1.3 2.1.9 3.1l1.8-1.3z" fill="#FBBC05" fillOpacity="0.7"/><path d="M12 5.4c.9 0 1.7.3 2.4.9l1.7-1.7C15.1 3.8 13.6 3 12 3 9.1 3 6.6 4.6 5.4 7.2l2 1.5c.5-1 1.5-1.8 2.6-2.1z" fill="#EA4335" fillOpacity="0.7"/><path d="M3 12c0 1.1.2 2.1.6 3.1L6.5 13c-.1-.3-.1-.7-.1-1s0-.7.1-1L3.6 8.9C3.2 9.9 3 10.9 3 12z" fill="#34A853" fillOpacity="0.7"/></svg></button>
              <button onClick={handleGithubLogin} style={{ backgroundColor: 'transparent', color: '#ffffff', border: 'none', padding: '18px 28px', fontSize: '18px', fontWeight: '300', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><span>GITHUB</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.21.68-.48 0-.24-.01-.88-.01-1.73-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z" fill="#ffffff" fillOpacity="0.8"/></svg></button>
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', margin: '30px 0', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '16px', fontWeight: '300', position: 'relative' }}><span style={{ backgroundColor: '#000000', padding: '0 20px' }}>ATAU</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {authMode === 'register' && (<input type="text" placeholder="NAMA" value={authName} onChange={(e) => setAuthName(e.target.value)} style={{ padding: '18px 0', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#ffffff', fontSize: '18px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300', outline: 'none' }} onFocus={(e) => e.currentTarget.style.borderBottomColor = '#ffffff'} onBlur={(e) => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)'} />)}
              <input type="email" placeholder="EMAIL" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ padding: '18px 0', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#ffffff', fontSize: '18px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300', outline: 'none' }} onFocus={(e) => e.currentTarget.style.borderBottomColor = '#ffffff'} onBlur={(e) => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)'} />
              <input type="password" placeholder="PASSWORD" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ padding: '18px 0', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#ffffff', fontSize: '18px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300', outline: 'none' }} onFocus={(e) => e.currentTarget.style.borderBottomColor = '#ffffff'} onBlur={(e) => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)'} />
              {authError && (<div style={{ color: '#ff4444', fontSize: '14px', textAlign: 'center', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300', padding: '10px' }}>{authError}</div>)}
              <button onClick={authMode === 'login' ? handleEmailLogin : handleEmailRegister} style={{ backgroundColor: 'transparent', color: '#ffffff', border: 'none', padding: '18px 0', fontSize: '18px', fontWeight: '300', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", marginTop: '10px', transition: 'opacity 0.2s', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '30px' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><span>{authMode === 'login' ? 'LOGIN' : 'DAFTAR'}</span><NorthEastArrowIcon size={20} /></button>
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ backgroundColor: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontWeight: '300', marginTop: '10px', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>{authMode === 'login' ? 'BELUM PUNYA AKUN? DAFTAR' : 'SUDAH PUNYA AKUN? LOGIN'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR CALL MODAL */}
      {showCalendarModal && (
        <div className="calendar-modal-overlay">
          <div ref={modalRef} className="calendar-modal" style={{ maxWidth: '1300px', maxHeight: '85vh', overflow: 'auto' }}>
            {!showFormView ? (
              <div style={{ display: 'flex', flexDirection: 'row', height: 'auto', minHeight: '620px' }}>
                <div style={{ flex: 1.1, padding: '36px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}><div style={{ width: '75px', height: '95px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '2px solid #e0e0e0' }}><Image src="/images/5.jpg" alt="Farid Ardiansyah" fill style={{ objectFit: 'cover', objectPosition: 'center' }} /></div><div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '26px', fontWeight: '600', color: '#000000' }}>{user?.displayName || user?.email?.split('@')[0] || 'Guest'}</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', color: '#666666' }}>{user?.email === ADMIN_EMAIL ? 'Administrator' : (user ? 'Member' : 'Guest User')}</div></div></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '18px', fontWeight: '600', color: '#000000', marginBottom: '10px' }}>Tentang Kerjasama</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666666', lineHeight: '1.5' }}>Diskusi tentang kolaborasi pengembangan website, aplikasi mobile, atau konsultasi teknologi. Saya siap membantu mewujudkan ide digital Anda!</div></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Waktu Tunggu Respon</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '13px', color: '#c5e800', backgroundColor: '#1a1a1a', display: 'inline-block', padding: '5px 14px', borderRadius: '60px' }}>Maksimal 1x24 jam</div></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', color: '#000000', marginBottom: '14px' }}>Tipe Meeting</div><div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{["Online", "Offline", "Hybrid"].map((type) => (<button key={type} onClick={() => setMeetingType(type)} style={{ padding: '8px 24px', borderRadius: '60px', border: meetingType === type ? '2px solid #000000' : '1px solid #cccccc', backgroundColor: meetingType === type ? '#000000' : '#ffffff', color: meetingType === type ? '#ffffff' : '#000000', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease' }}>{type}</button>))}</div></div>
                </div>
                <div style={{ flex: 2, padding: '36px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}><button onClick={() => changeMonth(-1)} style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #cccccc', backgroundColor: '#ffffff', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Prev</button><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '22px', fontWeight: '600', color: '#000000' }}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div><button onClick={() => changeMonth(1)} style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #cccccc', backgroundColor: '#ffffff', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>Next<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '14px' }}>{weekDays.map((day) => (<div key={day} style={{ textAlign: 'center', fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', color: '#999999', padding: '10px' }}>{day}</div>))}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>{days.map((date, index) => (<div key={index} onClick={() => date && handleDateSelect(date)} className="calendar-day" style={{ textAlign: 'center', padding: '14px 6px', backgroundColor: date ? getDayColor(date) : 'transparent', color: date ? '#ffffff' : 'transparent', cursor: date ? 'pointer' : 'default', fontWeight: date ? '600' : 'normal', borderRadius: '14px', opacity: date ? 1 : 0.3, fontSize: '16px', boxShadow: selectedDate?.toDateString() === date?.toDateString() ? '0 0 0 2px #000000' : 'none', position: 'relative' }}>{date ? date.getDate() : ''}</div>))}</div>
                  {selectedDate && (<div style={{ marginTop: '28px' }}><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', color: '#000000', marginBottom: '16px' }}>Pilih Waktu - {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{timeSlots.map((time) => (<button key={time} onClick={() => setSelectedTime(time)} className="time-slot" style={{ padding: '10px 22px', borderRadius: '60px', border: selectedTime === time ? '2px solid #000000' : '1px solid #cccccc', backgroundColor: selectedTime === time ? '#000000' : '#ffffff', color: selectedTime === time ? '#ffffff' : '#000000', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '500' }}>{time} WIB</button>))}</div></div>)}
                </div>
                <div style={{ flex: 1.1, padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '20px', fontWeight: '700', color: '#000000', paddingBottom: '14px', borderBottom: '2px solid #e0e0e0' }}>Rekomendasi Jadwal</div>
                  <div onClick={() => { setSelectedDate(tomorrow); setSelectedTime("10:00"); }} style={{ padding: '22px', backgroundColor: '#c5e800', borderRadius: '20px', color: '#000000', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1.5"/><path d="M12 8v4l3 3" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/></svg>BESOK</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{tomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '500', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>{timeSlots[2]} - {timeSlots[4]} WIB</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '12px', opacity: 0.7 }}>Slot terbaik</div></div>
                  <div onClick={() => { setSelectedDate(dayAfterTomorrow); setSelectedTime("13:00"); }} style={{ padding: '22px', backgroundColor: '#ff69b4', borderRadius: '20px', color: '#ffffff', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z" stroke="#ffffff" strokeWidth="1.5" fill="none"/></svg>LUSA</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{dayAfterTomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '500', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>{timeSlots[1]} - {timeSlots[3]} WIB</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '12px', opacity: 0.7 }}>Paling diminati</div></div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexDirection: 'column' }}><button onClick={() => setShowCalendarModal(false)} style={{ padding: '12px 20px', backgroundColor: '#ffffff', color: '#000000', border: '2px solid #cccccc', borderRadius: '60px', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.backgroundColor = '#f5f5f5'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cccccc'; e.currentTarget.style.backgroundColor = '#ffffff'; }}><NorthWestArrowIcon size={18} />Back</button><button onClick={() => { if (selectedDate && selectedTime) { setShowFormView(true); } else { alert("Silakan pilih tanggal dan waktu terlebih dahulu!"); } }} style={{ padding: '14px 20px', backgroundColor: '#0000ff', color: '#ffffff', border: 'none', borderRadius: '60px', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '16px', fontWeight: '600', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2200dd'; e.currentTarget.style.transform = 'scale(1.02)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0000ff'; e.currentTarget.style.transform = 'scale(1)'; }}>Schedule Meeting<NorthEastArrowIcon size={18} /></button></div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'row', height: 'auto', minHeight: '620px', maxHeight: '85vh' }}>
                <div style={{ flex: 1.1, padding: '36px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '28px', height: 'calc(85vh - 72px)', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}><div style={{ width: '75px', height: '95px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '2px solid #e0e0e0' }}><Image src="/images/5.jpg" alt="Farid Ardiansyah" fill style={{ objectFit: 'cover', objectPosition: 'center' }} /></div><div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '26px', fontWeight: '600', color: '#000000' }}>Farid Ardiansyah</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', color: '#666666' }}>Founder & Programmer</div></div></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '18px', fontWeight: '600', color: '#000000', marginBottom: '14px' }}>Ringkasan Meeting</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666666', lineHeight: '1.6' }}><div style={{ marginBottom: '8px' }}><strong>Tanggal:</strong> {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><div style={{ marginBottom: '8px' }}><strong>Waktu:</strong> {selectedTime} WIB</div><div style={{ marginBottom: '8px' }}><strong>Tipe Meeting:</strong> {meetingType}</div></div></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Waktu Tunggu Respon</div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '13px', color: '#c5e800', backgroundColor: '#1a1a1a', display: 'inline-block', padding: '5px 14px', borderRadius: '60px' }}>Maksimal 1x24 jam</div></div>
                </div>
                <div style={{ flex: 2.2, padding: '36px', display: 'flex', flexDirection: 'column', gap: '18px', height: 'calc(85vh - 72px)', overflowY: 'auto' }}>
                  <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '22px', fontWeight: '700', color: '#000000', paddingBottom: '14px', borderBottom: '2px solid #e0e0e0', position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10 }}>Isi Data Diri</div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Nama Lengkap <span style={{ color: '#ff4444' }}>*</span></div><input type="text" id="fullName" defaultValue={user?.displayName || user?.email?.split('@')[0] || ""} placeholder="Masukkan nama lengkap Anda" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cccccc', fontFamily: "'Questrial', sans-serif", fontSize: '14px', outline: 'none' }} onFocus={(e) => e.currentTarget.style.borderColor = '#000000'} onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'} /></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Email Address <span style={{ color: '#ff4444' }}>*</span></div><input type="email" id="emailAddress" defaultValue={user?.email || ""} placeholder="contoh@email.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cccccc', fontFamily: "'Questrial', sans-serif", fontSize: '14px', outline: 'none' }} onFocus={(e) => e.currentTarget.style.borderColor = '#000000'} onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'} /></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Platform Meeting <span style={{ color: '#ff4444' }}>*</span></div><select id="locationOption" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cccccc', fontFamily: "'Questrial', sans-serif", fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' }}><option value="">Pilih platform meeting</option><option value="google_meet">Google Meet</option><option value="zoom">Zoom</option><option value="tatap_muka">Tatap Muka (Offline)</option><option value="via_hp">Via Nomor HP (Telepon/WA)</option></select></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Nama Perusahaan / Instansi</div><input type="text" id="companyName" placeholder="Masukkan nama perusahaan Anda" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cccccc', fontFamily: "'Questrial', sans-serif", fontSize: '14px', outline: 'none' }} onFocus={(e) => e.currentTarget.style.borderColor = '#000000'} onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'} /></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Kenapa Anda percaya dengan saya? <span style={{ color: '#ff4444' }}>*</span></div><textarea id="trustReason" placeholder="Ceritakan alasan Anda percaya dan ingin berkolaborasi..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cccccc', fontFamily: "'Questrial', sans-serif", fontSize: '14px', outline: 'none', resize: 'vertical' }} onFocus={(e) => e.currentTarget.style.borderColor = '#000000'} onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'} /></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Nomor WhatsApp / HP <span style={{ color: '#ff4444' }}>*</span></div><input type="tel" id="phoneNumber" placeholder="+62 xxx-xxxx-xxxx" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cccccc', fontFamily: "'Questrial', sans-serif", fontSize: '14px', outline: 'none' }} onFocus={(e) => e.currentTarget.style.borderColor = '#000000'} onBlur={(e) => e.currentTarget.style.borderColor = '#cccccc'} /></div>
                  <div><div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Tambah Guest (Opsional)</div><div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><input type="email" id="guestEmail" placeholder="Email guest (maks 3 orang)" style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #cccccc', fontFamily: "'Questrial', sans-serif", fontSize: '14px', outline: 'none' }} /><button id="addGuestBtn" style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #000000', backgroundColor: '#ffffff', color: '#000000', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '500' }}>+ Add</button></div><div id="guestList" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}></div></div>
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '12px', textAlign: 'center' }}><span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '12px', color: '#666666' }}>By proceeding, you agree to <span style={{ color: '#000000', fontWeight: '600', cursor: 'pointer' }}>Menuru Terms</span> and <span style={{ color: '#000000', fontWeight: '600', cursor: 'pointer' }}> Privacy Policy</span>.</span></div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '16px', marginBottom: '8px', position: 'sticky', bottom: 0, backgroundColor: '#ffffff', paddingTop: '12px', paddingBottom: '8px' }}><button onClick={() => setShowFormView(false)} style={{ flex: 1, padding: '12px 20px', backgroundColor: '#ffffff', color: '#000000', border: '2px solid #cccccc', borderRadius: '60px', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.backgroundColor = '#f5f5f5'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cccccc'; e.currentTarget.style.backgroundColor = '#ffffff'; }}><NorthWestArrowIcon size={18} />Back</button><button onClick={handleConfirmMeeting} style={{ flex: 1, padding: '12px 20px', backgroundColor: '#0000ff', color: '#ffffff', border: 'none', borderRadius: '60px', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2200dd'; e.currentTarget.style.transform = 'scale(1.02)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0000ff'; e.currentTarget.style.transform = 'scale(1)'; }}>Confirm<NorthEastArrowIcon size={18} /></button></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHOTO MODAL */}
      {selectedPhotoIndex !== null && donation && (
        <div className="photo-modal-overlay" onClick={() => setSelectedPhotoIndex(null)}>
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '80vw', height: '80vh' }}>
              <Image src={donation.photos?.[selectedPhotoIndex] || ""} alt={`Donation photo ${selectedPhotoIndex + 1}`} fill style={{ objectFit: 'contain' }} />
              <button onClick={() => setSelectedPhotoIndex(null)} style={{ position: 'absolute', top: '-40px', right: '-40px', background: 'none', border: 'none', color: '#ffffff', fontSize: '32px', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENT MODAL */}
      {showCommentModal && donation && (
        <div className="comment-modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '32px', width: '90%', maxWidth: '500px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '24px', fontWeight: '400', margin: 0 }}>Komentar Foto</h3>
              <button onClick={() => setShowCommentModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }}>
              {photoComments[currentCommentPhotoIndex]?.length > 0 ? (
                photoComments[currentCommentPhotoIndex].map((comment) => (
                  <div key={comment.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '16px', fontWeight: '500', flexShrink: 0 }}>{comment.userName.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif", fontSize: '14px', fontWeight: '500', color: '#000000' }}>{comment.userName}</span>
                        <VerifiedBadge size={14} />
                        <span style={{ fontSize: '11px', color: '#999999' }}>{comment.timestamp?.toDate ? new Date(comment.timestamp.toDate()).toLocaleDateString('id-ID') : 'Baru saja'}</span>
                      </div>
                      <p style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#333333', margin: 0, lineHeight: '1.4' }}>{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#999999', padding: '40px', fontFamily: "'Questrial', sans-serif" }}>Belum ada komentar. Jadilah yang pertama!</div>
              )}
            </div>
            {user ? (
              <div>
                <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Tulis komentar Anda..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e0e0e0', fontFamily: "'Questrial', sans-serif", fontSize: '14px', resize: 'vertical', marginBottom: '16px' }} />
                <button onClick={addComment} style={{ padding: '12px 24px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '60px', cursor: 'pointer', fontFamily: "'Questrial', sans-serif", fontSize: '14px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Kirim Komentar<NorthEastArrowIcon size={16} /></button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '16px' }}>
                <span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666666' }}>Silakan login untuk berkomentar</span>
                <button onClick={() => setShowAuthModal(true)} style={{ marginLeft: '12px', padding: '6px 16px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '60px', cursor: 'pointer', fontSize: '12px' }}>Login</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COOKIE POPUP */}
      {showPopup && !isLoading && (
        <div style={{ position: 'fixed', bottom: '30px', left: '30px', right: '30px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '32px', padding: '28px 40px', boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 5px 12px rgba(0,0,0,0.1)', zIndex: 1000, fontFamily: 'Questrial, sans-serif', animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '48px', display: 'inline-block' }}>🍪</span><span style={{ fontWeight: '700', fontSize: '32px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', fontFamily: 'Questrial, sans-serif' }}>Cookies Notice</span></div>
            <p style={{ fontSize: '18px', lineHeight: '1.5', marginBottom: 0, color: '#ffffff', fontWeight: '400', letterSpacing: '-0.01em', maxWidth: '600px', fontFamily: 'Questrial, sans-serif' }}>This site uses cookies to provide you with the best user experience. By using this website, you accept our use of cookies.</p>
            <Link href="/privacy-policy" passHref><span className="cookie-link" style={{ color: '#aaaaaa', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Questrial, sans-serif', fontWeight: '500' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaaaaa'}>Show details<NorthEastArrowIcon size={14} /></span></Link>
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', flexShrink: 0 }}><button ref={declineBtnRef} onClick={handleDecline} style={{ padding: '12px 28px', backgroundColor: '#000000', color: '#ffffff', border: '1.5px solid #333333', borderRadius: '60px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', letterSpacing: '-0.01em', fontFamily: 'Questrial, sans-serif', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden', zIndex: 1, background: '#000000' }}>Decline</button><button ref={acceptBtnRef} onClick={handleAccept} style={{ padding: '12px 28px', backgroundColor: '#000000', color: '#ffffff', border: '1.5px solid #ffffff', borderRadius: '60px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', letterSpacing: '-0.01em', fontFamily: 'Questrial, sans-serif', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden', zIndex: 1, background: '#000000' }}>Accept</button></div>
        </div>
      )}
    </>
  );
}
