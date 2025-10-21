'use client';

import SignInPage from '../components/auth/signin-page';
import SignUpPage from '../components/auth/signup-page';
import ForgotPasswordPage from '../components/auth/forgot-password-page';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs } from "firebase/firestore";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYbxo8n1zn-Y3heCIn_PmrsK44_OrdEw4",
  authDomain: "noted-a3498.firebaseapp.com",
  databaseURL: "https://noted-a3498-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "noted-a3498",
  storageBucket: "noted-a3498.firebasestorage.app",
  messagingSenderId: "1077214793842",
  appId: "1:1077214793842:web:a70cc3643eceb53e3932eb",
  measurementId: "G-SENDQS5Y7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data untuk Home dan Topics dengan gambar
const homeContent = [
  {
    id: 1,
    title: "Creative Design",
    description: "Innovative design solutions that transform ideas into visually stunning experiences",
    color: "#FF6B6B",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    category: "Design"
  },
  {
    id: 2,
    title: "Digital Strategy",
    description: "Comprehensive digital strategies to elevate your brand in the online space",
    color: "#4ECDC4",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: "Strategy"
  },
  {
    id: 3,
    title: "User Experience",
    description: "Creating seamless and intuitive user experiences that drive engagement",
    color: "#45B7D1",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
    category: "UX/UI"
  },
  {
    id: 4,
    title: "Brand Identity",
    description: "Developing unique brand identities that resonate with your target audience",
    color: "#96CEB4",
    image: "https://images.unsplash.com/photo-1567446537711-4302c76c2904?w=400&h=300&fit=crop",
    category: "Branding"
  },
  {
    id: 5,
    title: "Web Development",
    description: "Modern web development using cutting-edge technologies and best practices",
    color: "#FFEAA7",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    category: "Development"
  }
];

const topicsContent = [
  {
    id: 1,
    title: "Artificial Intelligence",
    description: "Exploring the future of AI and machine learning technologies",
    color: "#6C5CE7",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    category: "Technology"
  },
  {
    id: 2,
    title: "Blockchain Technology",
    description: "Understanding decentralized systems and cryptocurrency innovations",
    color: "#FD79A8",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
    category: "Technology"
  },
  {
    id: 3,
    title: "Sustainable Design",
    description: "Eco-friendly design principles for a better tomorrow",
    color: "#00B894",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
    category: "Design"
  },
  {
    id: 4,
    title: "Mobile Development",
    description: "Creating powerful mobile applications for iOS and Android",
    color: "#FDCB6E",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    category: "Development"
  },
  {
    id: 5,
    title: "Data Analytics",
    description: "Transforming raw data into actionable insights and intelligence",
    color: "#E17055",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: "Analytics"
  },
  {
    id: 6,
    title: "Cloud Computing",
    description: "Leveraging cloud infrastructure for scalable solutions",
    color: "#74B9FF",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    category: "Technology"
  },
  {
    id: 7,
    title: "Cybersecurity",
    description: "Protecting digital assets with advanced security measures",
    color: "#A29BFE",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
    category: "Security"
  },
  {
    id: 8,
    title: "IoT Solutions",
    description: "Connecting devices and creating smart ecosystems",
    color: "#55E6C1",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    category: "Technology"
  },
  {
    id: 9,
    title: "AR/VR Development",
    description: "Building immersive augmented and virtual reality experiences",
    color: "#FF7675",
    image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=300&fit=crop",
    category: "Development"
  },
  {
    id: 10,
    title: "Quantum Computing",
    description: "Exploring the next frontier in computational power",
    color: "#BADCDD",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
    category: "Technology"
  }
];

export default function HomePage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [menuText, setMenuText] = useState("MENU");
  const [isAnimating, setIsAnimating] = useState(false);
  const [visitorTime, setVisitorTime] = useState({
    time: "",
    timezone: "",
    date: ""
  });
  const [visitorLocation, setVisitorLocation] = useState({
    city: "",
    region: "",
    country: "Indonesia",
    isManual: false
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState({ city: "", region: "" });
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  
  // State untuk menu Home dan Topics
  const [activeSection, setActiveSection] = useState<"home" | "topics" | null>(null);
  const [showContent, setShowContent] = useState(false);
  
  // State untuk search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState<"empty" | "recent" | "updated" | "loading">("empty");

  
  const router = useRouter();
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk search
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchStatusRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk content
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const contentItemsRef = useRef<(HTMLDivElement | null)[]>([]);



  // PERBAIKAN: Sistem z-index terorganisir
  const zIndexes = {
    banner: 100,
    search: 90,
    content: 85,
    menu: 80,
    modal: 200,
    loading: 300
  };

  // Database kota-kota Indonesia
  const indonesiaCities = [
    { city: "Jakarta", region: "DKI Jakarta" },
    { city: "Surabaya", region: "Jawa Timur" },
    { city: "Bandung", region: "Jawa Barat" },
    { city: "Medan", region: "Sumatera Utara" },
    { city: "Semarang", region: "Jawa Tengah" },
    { city: "Makassar", region: "Sulawesi Selatan" },
    { city: "Palembang", region: "Sumatera Selatan" },
    { city: "Denpasar", region: "Bali" },
    { city: "Batam", region: "Kepulauan Riau" },
    { city: "Pekanbaru", region: "Riau" },
    { city: "Bandar Lampung", region: "Lampung" },
    { city: "Padang", region: "Sumatera Barat" },
    { city: "Malang", region: "Jawa Timur" },
    { city: "Samarinda", region: "Kalimantan Timur" },
    { city: "Banjarmasin", region: "Kalimantan Selatan" },
    { city: "Serang", region: "Banten" },
    { city: "Jambi", region: "Jambi" },
    { city: "Pontianak", region: "Kalimantan Barat" },
    { city: "Manado", region: "Sulawesi Utara" },
    { city: "Cirebon", region: "Jawa Barat" },
    { city: "Balikpapan", region: "Kalimantan Timur" },
    { city: "Bogor", region: "Jawa Barat" },
    { city: "Yogyakarta", region: "DI Yogyakarta" },
    { city: "Tangerang", region: "Banten" },
    { city: "Bekasi", region: "Jawa Barat" },
    { city: "Sukabumi", region: "Jawa Barat" },
    { city: "Tasikmalaya", region: "Jawa Barat" },
    { city: "Pekalongan", region: "Jawa Tengah" },
    { city: "Depok", region: "Jawa Barat" },
    { city: "Cimahi", region: "Jawa Barat" },
    { city: "Palu", region: "Sulawesi Tengah" },
    { city: "Kupang", region: "Nusa Tenggara Timur" },
    { city: "Binjai", region: "Sumatera Utara" },
    { city: "Mataram", region: "Nusa Tenggara Barat" },
    { city: "Banda Aceh", region: "Aceh" },
    { city: "Jayapura", region: "Papua" },
    { city: "Singkawang", region: "Kalimantan Barat" },
    { city: "Tegal", region: "Jawa Tengah" },
    { city: "Kediri", region: "Jawa Timur" },
    { city: "Blitar", region: "Jawa Timur" },
    { city: "Madiun", region: "Jawa Timur" },
    { city: "Pasuruan", region: "Jawa Timur" },
    { city: "Magelang", region: "Jawa Tengah" },
    { city: "Probolinggo", region: "Jawa Timur" },
    { city: "Salatiga", region: "Jawa Tengah" },
    { city: "Bitung", region: "Sulawesi Utara" },
    { city: "Tanjung Pinang", region: "Kepulauan Riau" },
    { city: "Ternate", region: "Maluku Utara" },
    { city: "Bontang", region: "Kalimantan Timur" },
    { city: "Bau-bau", region: "Sulawesi Tenggara" },
    { city: "Tidore", region: "Maluku Utara" },
    { city: "Gorontalo", region: "Gorontalo" },
    { city: "Prabumulih", region: "Sumatera Selatan" },
    { city: "Lubuklinggau", region: "Sumatera Selatan" },
    { city: "Pageralam", region: "Sumatera Selatan" },
    { city: "Pagaralam", region: "Sumatera Selatan" },
    { city: "Sawahlunto", region: "Sumatera Barat" },
    { city: "Solok", region: "Sumatera Barat" },
    { city: "Payakumbuh", region: "Sumatera Barat" },
    { city: "Bukittinggi", region: "Sumatera Barat" },
    { city: "Pariaman", region: "Sumatera Barat" },
    { city: "Padang Panjang", region: "Sumatera Barat" },
    { city: "Sibolga", region: "Sumatera Utara" },
    { city: "Tanjungbalai", region: "Sumatera Utara" },
    { city: "Pematangsiantar", region: "Sumatera Utara" },
    { city: "Tebing Tinggi", region: "Sumatera Utara" },
    { city: "Kisaran", region: "Sumatera Utara" },
    { city: "Gunungsitoli", region: "Sumatera Utara" },
    { city: "Padangsidempuan", region: "Sumatera Utara" },
    { city: "Sungai Penuh", region: "Jambi" },
    { city: "Jambi", region: "Jambi" },
    { city: "Bengkulu", region: "Bengkulu" },
    { city: "Curup", region: "Bengkulu" },
    { city: "Manna", region: "Bengkulu" },
    { city: "Argamakmur", region: "Bengkulu" },
    { city: "Muko-muko", region: "Bengkulu" },
    { city: "Kaur", region: "Bengkulu" },
    { city: "Kepahiang", region: "Bengkulu" },
    { city: "Lebong", region: "Bengkulu" },
    { city: "Seluma", region: "Bengkulu" },
    { city: "Lahat", region: "Sumatera Selatan" },
    { city: "Lubuk Linggau", region: "Sumatera Selatan" },
    { city: "Pagar Alam", region: "Sumatera Selatan" },
    { city: "Prabumulih", region: "Sumatera Selatan" },
    { city: "Muara Enim", region: "Sumatera Selatan" },
    { city: "Banyuasin", region: "Sumatera Selatan" },
    { city: "Ogan Komering Ilir", region: "Sumatera Selatan" },
    { city: "Ogan Komering Ulu", region: "Sumatera Selatan" },
    { city: "Empat Lawang", region: "Sumatera Selatan" },
    { city: "Musi Rawas", region: "Sumatera Selatan" },
    { city: "Musi Banyuasin", region: "Sumatera Selatan" },
    { city: "Bangka", region: "Kepulauan Bangka Belitung" },
    { city: "Belitung", region: "Kepulauan Bangka Belitung" },
    { city: "Pangkal Pinang", region: "Kepulauan Bangka Belitung" },
    { city: "Sungai Liat", region: "Kepulauan Bangka Belitung" },
    { city: "Tanjung Pandan", region: "Kepulauan Bangka Belitung" },
    { city: "Manggar", region: "Kepulauan Bangka Belitung" },
    { city: "Koba", region: "Kepulauan Bangka Belitung" },
    { city: "Tempuran", region: "Jawa Barat" }
  ];

  // Generate atau load user ID
  useEffect(() => {
    const initializeUser = async () => {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
      }
      setCurrentUserId(userId);
      
      // Load location dari Firestore
      await loadLocationFromFirestore(userId);
    };

    initializeUser();
  }, []);

  // Animasi banner dengan GSAP
  useEffect(() => {
    if (showBanner && bannerRef.current) {
      const tl = gsap.timeline();
      
      // Animasi masuk banner dari atas
      tl.fromTo(bannerRef.current,
        { 
          y: -100,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [showBanner]);

  // Fungsi untuk close banner
  const closeBanner = () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.6,
        ease: "back.in(1.7)",
        onComplete: () => setShowBanner(false)
      });
    }
  };

  // Fungsi untuk handle click banner (ke halaman notes)
  const handleBannerClick = () => {
    navigateToNotes();
  };

  // Load location dari Firestore
  const loadLocationFromFirestore = async (userId: string) => {
    try {
      setIsLoadingLocation(true);
      const userDocRef = doc(db, 'userLocations', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setVisitorLocation({
          city: userData.city,
          region: userData.region,
          country: userData.country || "Indonesia",
          isManual: true
        });
      } else {
        // Jika tidak ada data di Firestore, coba deteksi otomatis
        tryAutoLocation(userId);
      }
    } catch (error) {
      console.error('Error loading location from Firestore:', error);
      // Fallback ke deteksi otomatis
      tryAutoLocation(userId);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Save location ke Firestore
  const saveLocationToFirestore = async (userId: string, location: any) => {
    try {
      const userDocRef = doc(db, 'userLocations', userId);
      await setDoc(userDocRef, {
        city: location.city,
        region: location.region,
        country: location.country || "Indonesia",
        lastUpdated: new Date().toISOString(),
        userId: userId
      }, { merge: true });
      
      console.log('Location saved to Firestore successfully');
      return true;
    } catch (error) {
      console.error('Error saving location to Firestore:', error);
      return false;
    }
  };

  // Coba deteksi lokasi otomatis sederhana
  const tryAutoLocation = async (userId: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const timezoneMap: { [key: string]: { city: string, region: string } } = {
      'Asia/Jakarta': { city: "Jakarta", region: "DKI Jakarta" },
      'Asia/Makassar': { city: "Makassar", region: "Sulawesi Selatan" },
      'Asia/Jayapura': { city: "Jayapura", region: "Papua" },
      'Asia/Pontianak': { city: "Pontianak", region: "Kalimantan Barat" }
    };

    const detectedLocation = timezoneMap[timezone];
    
    if (detectedLocation) {
      const location = {
        ...detectedLocation,
        country: "Indonesia",
        isManual: false
      };
      setVisitorLocation(location);
      // Simpan ke Firestore juga
      await saveLocationToFirestore(userId, location);
    } else {
      // Default location
      const defaultLocation = {
        city: "Jakarta",
        region: "DKI Jakarta",
        country: "Indonesia",
        isManual: false
      };
      setVisitorLocation(defaultLocation);
      await saveLocationToFirestore(userId, defaultLocation);
    }
  };

  // Fungsi untuk mengambil semua data user
  const fetchAllUsersData = async () => {
    try {
      setIsLoadingAllUsers(true);
      const usersCollection = collection(db, 'userLocations');
      const usersSnapshot = await getDocs(usersCollection);
      
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Urutkan berdasarkan lastUpdated (terbaru pertama)
      usersData.sort((a: any, b: any) => {
        const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return dateB - dateA;
      });
      
      setAllUsersData(usersData);
      setShowAllUsers(true);
    } catch (error) {
      console.error('Error fetching all users data:', error);
      alert('Gagal mengambil data users. Silakan coba lagi.');
    } finally {
      setIsLoadingAllUsers(false);
    }
  };

  // Fungsi untuk membuka modal semua users
  const openAllUsersModal = () => {
    fetchAllUsersData();
  };

  // Fungsi untuk toggle search
  const toggleSearch = () => {
    if (showSearch) {
      closeSearch();
    } else {
      openSearch();
    }
  };

  // Fungsi untuk membuka search dengan animasi GSAP
  const openSearch = () => {
    setShowSearch(true);
    
    // Reset status search
    setSearchStatus("empty");
    setSearchQuery("");
    
    setTimeout(() => {
      if (searchContainerRef.current && searchInputRef.current) {
        const tl = gsap.timeline();
        
        // Animasi container search
        tl.fromTo(searchContainerRef.current,
          {
            scale: 0.8,
            opacity: 0,
            y: -20
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
          }
        );
        
        // Animasi input field
        tl.fromTo(searchInputRef.current,
          {
            width: "0%",
            opacity: 0
          },
          {
            width: "100%",
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          },
          "-=0.2"
        );
        
        // Focus ke input setelah animasi
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 300);
      }
    }, 10);
  };

  // Fungsi untuk menutup search dengan animasi GSAP
  const closeSearch = () => {
    if (searchContainerRef.current) {
      const tl = gsap.timeline();
      
      tl.to(searchContainerRef.current, {
        scale: 0.8,
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => setShowSearch(false)
      });
    } else {
      setShowSearch(false);
    }
  };

  // Fungsi untuk handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Update search status berdasarkan input
    if (value.length === 0) {
      setSearchStatus("empty");
    } else if (value.length > 0 && value.length < 3) {
      setSearchStatus("loading");
      
      // Simulasi loading
      setTimeout(() => {
        if (searchQuery === value) {
          setSearchStatus("recent");
        }
      }, 500);
    } else {
      setSearchStatus("updated");
    }
  };

  // Fungsi untuk handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Logic untuk search bisa ditambahkan di sini
      console.log("Search for:", searchQuery);
      
      // Tampilkan status updated
      setSearchStatus("updated");
      
      // Close search setelah submit (opsional)
      setTimeout(() => {
        closeSearch();
      }, 1000);
    }
  };

  // Effect untuk keyboard shortcut (Ctrl+K atau Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      
      if (e.key === 'Escape' && showSearch) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearch]);

  // Effect untuk animasi status search
  useEffect(() => {
    if (searchStatusRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(searchStatusRef.current,
        {
          y: 10,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  }, [searchStatus]);

  // Fungsi untuk membuka section Home atau Topics dengan animasi GSAP
  const openSection = (section: "home" | "topics") => {
    setActiveSection(section);
    setShowContent(true);
    
    // Tutup menu
    setShowMenu(false);
    
    // Animasi GSAP untuk content
    setTimeout(() => {
      if (contentContainerRef.current) {
        const tl = gsap.timeline();
        
        // Animasi container
        tl.fromTo(contentContainerRef.current,
          {
            scale: 0.9,
            opacity: 0,
            y: 50
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.7)"
          }
        );
        
        // Animasi untuk setiap item content dengan efek staggered
        const items = contentItemsRef.current.filter(Boolean);
        items.forEach((item, index) => {
          if (item) {
            tl.fromTo(item,
              {
                x: -100,
                opacity: 0,
                scale: 0.8
              },
              {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: "back.out(1.7)"
              },
              `-=${0.4}`
            );
          }
        });
      }
    }, 100);
  };

  // Fungsi untuk menutup content dengan animasi GSAP
  const closeContent = () => {
    if (contentContainerRef.current) {
      const tl = gsap.timeline();
      
      // Animasi keluar untuk setiap item content
      const items = contentItemsRef.current.filter(Boolean);
      items.forEach((item, index) => {
        if (item) {
          tl.to(item, {
            x: 100,
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "back.in(1.7)"
          }, `-=${0.2}`);
        }
      });
      
      tl.to(contentContainerRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 50,
        duration: 0.4,
        ease: "back.in(1.7)",
        onComplete: () => {
          setShowContent(false);
          setActiveSection(null);
        }
      });
    } else {
      setShowContent(false);
      setActiveSection(null);
    }
  };

  useEffect(() => {
    if (showLoading) {
      startTextScrollAnimation();
    }

    // Initialize visitor time
    updateVisitorTime();
    
    // Update time every second
    timeRef.current = setInterval(updateVisitorTime, 1000);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, [showLoading]);

  const startTextScrollAnimation = () => {
    const tl = gsap.timeline();
    
    tl.fromTo(loadingRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    if (textScrollRef.current) {
      const textLines = textScrollRef.current.children;
      const textArray = Array.from(textLines);
      
      gsap.set(textArray, { y: -1000, opacity: 0, scale: 1 });

      tl.to(textArray[0], { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, "+=0.1");
      tl.to(textArray[0], { y: 1000, opacity: 0, duration: 0.3, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[1], { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.2");
      tl.to(textArray[1], { y: 1000, opacity: 0, duration: 0.25, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[2], { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.15");
      tl.to(textArray[2], { y: 1000, opacity: 0, duration: 0.2, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[3], { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, "-=0.1");
      tl.to(textArray[3], { y: 1000, opacity: 0, duration: 0.15, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[4], { y: 0, opacity: 1, duration: 0.2, ease: "power2.out" }, "-=0.05");
      tl.to(textArray[4], { y: 1000, opacity: 0, duration: 0.1, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[5], { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "+=0.2");
      tl.to(textArray[5], { scale: 1.1, duration: 0.3, ease: "power2.out" }, "+=0.5");
      tl.to(textArray[5], { scale: 1, duration: 0.2, ease: "power2.in" });
    }

    tl.to({}, {
      duration: 1,
      onComplete: () => {
        gsap.to(loadingRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => setShowLoading(false)
        });
      }
    });
  };

  const updateVisitorTime = () => {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const time = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const date = now.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timezoneAbbr = getTimezoneAbbreviation(timezone);

    setVisitorTime({
      time: time,
      timezone: timezoneAbbr,
      date: date
    });
  };

  const getTimezoneAbbreviation = (timezone: string): string => {
    const timezoneMap: { [key: string]: string } = {
      'Asia/Jakarta': 'WIB',
      'Asia/Makassar': 'WITA', 
      'Asia/Jayapura': 'WIT'
    };
    return timezoneMap[timezone] || 'LOCAL';
  };

  const navigateToNotes = () => {
    setShowLoading(true);
    setTimeout(() => {
      router.push('/notes');
    }, 1000);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Fungsi untuk membuka modal set lokasi
  const openLocationModal = () => {
    setTempLocation({
      city: visitorLocation.city,
      region: visitorLocation.region
    });
    setShowLocationModal(true);
  };

  // Fungsi untuk menyimpan lokasi manual
  const saveManualLocation = async () => {
    if (tempLocation.city && tempLocation.region && currentUserId) {
      const newLocation = {
        ...tempLocation,
        country: "Indonesia",
        isManual: true
      };
      
      setVisitorLocation(newLocation);
      
      // Simpan ke Firestore
      const success = await saveLocationToFirestore(currentUserId, newLocation);
      
      if (success) {
        setShowLocationModal(false);
      } else {
        alert('Gagal menyimpan lokasi. Silakan coba lagi.');
      }
    }
  };

  // Filter kota berdasarkan input
  const filteredCities = indonesiaCities.filter(city =>
    city.city.toLowerCase().includes(tempLocation.city.toLowerCase()) ||
    city.region.toLowerCase().includes(tempLocation.city.toLowerCase())
  );

  // Array teks menu yang akan berganti saat hover
  const menuTextVariants = ["EXPLORE", "NAVIGATE", "DISCOVER", "BROWSE"];

  const handleMenuHover = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    let currentIndex = 0;

    const animateText = () => {
      if (currentIndex < menuTextVariants.length) {
        setMenuText(menuTextVariants[currentIndex]);
        currentIndex++;
        animationRef.current = setTimeout(animateText, 100);
      } else {
        setTimeout(() => {
          setMenuText("MENU");
          setIsAnimating(false);
        }, 100);
      }
    };

    animateText();
  };

  const handleMenuLeave = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
    setMenuText("MENU");
  };

  // Variants for modern animations
  const menuVariants = {
    closed: {
      clipPath: "circle(0% at 95% 5%)",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1]
      }
    },
    open: {
      clipPath: "circle(150% at 95% 5%)",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  const menuItemVariants = {
    closed: {
      x: -50,
      opacity: 0,
      transition: {
        duration: 0.5
      }
    },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.1 + (i * 0.1),
        ease: "circOut"
      }
    })
  };

  const closeButtonVariants = {
    closed: {
      opacity: 0,
      rotate: -90,
      scale: 0
    },
    open: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.4,
        ease: "backOut"
      }
    }
  };

  const menuButtonVariants = {
    initial: {
      opacity: 0,
      y: -20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1.2,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      color: "#CCFF00",
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  // Variants untuk animasi teks menu
  const textVariants = {
    enter: {
      y: -10,
      opacity: 0,
      transition: {
        duration: 0.1
      }
    },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.1
      }
    },
    exit: {
      y: 10,
      opacity: 0,
      transition: {
        duration: 0.1
      }
    }
  };

  // Variants untuk animasi waktu
  const timeVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.6
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const menuItems = [
    { 
      name: "(01) HOME", 
      delay: 0.1,
      action: () => openSection("home")
    },
    { 
      name: "(02) TOPICS", 
      delay: 0.2,
      action: () => openSection("topics")
    },
    { 
      name: "(03) NOTES", 
      delay: 0.3,
      action: navigateToNotes
    },
    { 
      name: "(04) ABOUT", 
      delay: 0.4,
      action: () => console.log("About clicked")
    },
    { 
      name: "(05) CONTACT", 
      delay: 0.5,
      action: () => console.log("Contact clicked")
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arame Mono, monospace',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Search Component - PERBAIKAN z-index */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            ref={searchContainerRef}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '600px',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '2rem',
              zIndex: zIndexes.search,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "back.out(1.7)" }}
          >
            {/* Search Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: 0,
                fontFamily: 'Arame Mono, monospace'
              }}>
                Search
              </h3>
              
              {/* Close Button */}
              <motion.button
                onClick={closeSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                {/* Search Icon */}
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: 'rgba(255,255,255,0.4)'
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>

                {/* Search Input */}
                <motion.input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for anything..."
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  whileFocus={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                />

                {/* Keyboard Shortcut Hint */}
                <motion.div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'Arame Mono, monospace'
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  ⌘K
                </motion.div>
              </div>
            </form>

            {/* Search Status */}
            <AnimatePresence mode="wait">
              <motion.div
                ref={searchStatusRef}
                key={searchStatus}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'Arame Mono, monospace'
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Status Icon */}
                {searchStatus === "empty" && (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                          stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Type to start searching...
                    </span>
                  </>
                )}
                
                {searchStatus === "loading" && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" 
                          stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    <span style={{ color: '#CCFF00' }}>
                      Searching...
                    </span>
                  </>
                )}
                
                {searchStatus === "recent" && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L14 14M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" 
                          stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    <span style={{ color: '#CCFF00' }}>
                      Showing recent results...
                    </span>
                  </>
                )}
                
                {searchStatus === "updated" && (
                  <>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        color: ['#CCFF00', '#88FF00', '#CCFF00']
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    <span style={{ color: '#88FF00' }}>
                      Results updated successfully!
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Search Tips */}
            <motion.div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Quick tips:</div>
                <div>• Press <span style={{ color: 'rgba(255,255,255,0.6)' }}>⌘K</span> to open search anytime</div>
                <div>• Use <span style={{ color: 'rgba(255,255,255,0.6)' }}>ESC</span> to close</div>
                <div>• Type at least 3 characters for better results</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Overlay untuk Home dan Topics - PERBAIKAN z-index */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            ref={contentContainerRef}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem',
              zIndex: zIndexes.content,
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
              overflowY: 'auto'
            }}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: "back.out(1.7)" }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '1rem'
            }}>
              <h2 style={{
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: '600',
                margin: 0,
                fontFamily: 'Arame Mono, monospace'
              }}>
                {activeSection === 'home' ? 'HOME CONTENT' : 'TOPICS COLLECTION'}
              </h2>
              
              <motion.button
                onClick={closeContent}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  fontSize: '1.5rem',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  scale: 1.1
                }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>

            {/* Content Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              padding: '1rem 0'
            }}>
              {(activeSection === 'home' ? homeContent : topicsContent).map((item, index) => (
                <motion.div
                  key={item.id}
                  ref={el => contentItemsRef.current[index] = el}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${item.color}20`,
                    borderRadius: '15px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  initial={{ opacity: 0, x: -100, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "back.out(1.7)" }}
                  whileHover={{
                    scale: 1.02,
                    borderColor: `${item.color}60`,
                    boxShadow: `0 10px 30px ${item.color}20`
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Image Section */}
                  <div style={{
                    height: '200px',
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    {/* Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))'
                    }}></div>
                    
                    {/* Category Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: item.color,
                      color: 'white',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      {item.category}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div style={{
                    padding: '1.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        flexShrink: 0,
                        marginTop: '0.2rem'
                      }} />
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          color: 'white',
                          fontSize: '1.4rem',
                          fontWeight: '600',
                          margin: '0 0 0.5rem 0',
                          fontFamily: 'Arame Mono, monospace'
                        }}>
                          {item.title}
                        </h3>
                        <p style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '0.95rem',
                          lineHeight: '1.5',
                          margin: 0,
                          fontFamily: 'Arame Mono, monospace'
                        }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <motion.button
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: `1px solid ${item.color}40`,
                        borderRadius: '8px',
                        color: item.color,
                        cursor: 'pointer',
                        fontFamily: 'Arame Mono, monospace',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      whileHover={{
                        backgroundColor: item.color,
                        color: 'black'
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore More
                    </motion.button>
                  </div>
                  
                  {/* Hover Effect */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${item.color}10, transparent)`,
                      opacity: 0
                    }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.9rem',
                fontFamily: 'Arame Mono, monospace',
                margin: 0
              }}>
                {activeSection === 'home' 
                  ? `${homeContent.length} items in Home section` 
                  : `${topicsContent.length} items in Topics section`
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Trigger Button - PERBAIKAN: POSISI SEJAJAR DENGAN MENU */}
      {!showSearch && !showLoading && (
        <motion.button
          onClick={toggleSearch}
          style={{
            position: 'fixed',
            top: showBanner ? '4.5rem' : '2rem',
            right: '11rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'Arame Mono, monospace',
            fontSize: '0.85rem',
            backdropFilter: 'blur(10px)',
            zIndex: zIndexes.banner - 5,
            height: '48px'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          whileHover={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            scale: 1.05
          }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Search
          <span style={{
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.5)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: '0.25rem'
          }}>
            ⌘K
          </span>
        </motion.button>
      )}

      {/* Top Banner - PERBAIKAN: GANTI WARNA MENJADI MERAH STABILO */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            ref={bannerRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              backgroundColor: '#FF4444',
              padding: '0.8rem 2rem',
              zIndex: zIndexes.banner,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              fontFamily: 'Arame Mono, monospace',
              boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: "back.out(1.7)" }}
          >
            {/* SVG Icon */}
            <motion.div
              animate={{
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </motion.div>

            {/* Banner Text */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'white'
              }}
            >
              <span>WEBSITE NOTE SEDANG DALAM PERSIAPAN -</span>
              <motion.span
                onClick={handleBannerClick}
                style={{
                  color: 'white',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                whileHover={{ color: '#FFCCCB' }}
                whileTap={{ scale: 0.95 }}
              >
                Klik untuk melihat progress
              </motion.span>
            </motion.div>

            {/* Close Button */}
            <motion.button
              onClick={closeBanner}
              style={{
                position: 'absolute',
                right: '1rem',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.3)',
                scale: 1.1,
                color: 'white'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Display - PERBAIKAN z-index */}
      <motion.div
        onClick={openLocationModal}
        style={{
          position: 'absolute',
          top: showBanner ? '4.5rem' : '2rem',
          left: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.3rem',
          cursor: 'pointer',
          padding: '0.8rem 1.2rem',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '250px',
          zIndex: zIndexes.banner - 10
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{
          background: 'rgba(255,255,255,0.08)',
          transition: { duration: 0.2 }
        }}
      >
        <motion.div
          style={{
            fontSize: '1rem',
            fontWeight: '400',
            color: 'white',
            fontFamily: 'Arame Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {isLoadingLocation ? (
            <motion.span
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              Loading...
            </motion.span>
          ) : visitorLocation.city ? (
            `${visitorLocation.city}, ${visitorLocation.country}`
          ) : (
            <span style={{ opacity: 0.7 }}>Klik untuk set lokasi</span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </motion.div>
        <motion.div
          style={{
            fontSize: '0.8rem',
            fontWeight: '300',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Arame Mono, monospace'
          }}
        >
          {visitorTime.time} • {visitorTime.timezone}
          {visitorLocation.isManual && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', opacity: 0.5 }}>
              (manual)
            </span>
          )}
        </motion.div>
      </motion.div>

{/* Sign In Button - Navbar Tengah */}
<motion.button
  onClick={() => router.push('/signin')}  // Langsung panggil router.push di sini
  style={{
    position: 'fixed',
    top: showBanner ? '4.5rem' : '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0.6rem 1.5rem',
    fontSize: '0.85rem',
    fontWeight: '400',
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Arame Mono, monospace',
    backdropFilter: 'blur(10px)',
    whiteSpace: 'nowrap',
    zIndex: zIndexes.banner - 5,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.2, duration: 0.6 }}
  whileHover={{ 
    backgroundColor: 'rgba(255,255,255,0.15)',
    scale: 1.05,
    transition: { duration: 0.2 }
  }}
  whileTap={{ scale: 0.95 }}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
  SIGN IN
</motion.button>




      

      {/* Button untuk melihat semua users - PERBAIKAN z-index */}
      <motion.button
        onClick={openAllUsersModal}
        style={{
          position: 'absolute',
          top: showBanner ? '4.5rem' : '2rem',
          left: '16rem',
          padding: '0.6rem 1.2rem',
          fontSize: '0.8rem',
          fontWeight: '300',
          color: 'white',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Arame Mono, monospace',
          backdropFilter: 'blur(10px)',
          whiteSpace: 'nowrap',
          zIndex: zIndexes.banner - 10
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        whileHover={{ 
          backgroundColor: 'rgba(255,255,255,0.15)',
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        VIEW ALL USERS
      </motion.button>

      {/* Menu Button - PERBAIKAN z-index */}
      <motion.div
        onClick={toggleMenu}
        onMouseEnter={handleMenuHover}
        onMouseLeave={handleMenuLeave}
        style={{
          position: 'absolute',
          top: showBanner ? '4.5rem' : '2rem',
          right: '2rem',
          fontSize: '1.2rem',
          fontWeight: '300',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'Arame Mono, monospace',
          letterSpacing: '1.5px',
          zIndex: zIndexes.banner - 5,
          padding: '1rem 1.8rem',
          borderRadius: '30px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(15px)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '160px',
          justifyContent: 'center'
        }}
        variants={menuButtonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        {/* Animated hamburger icon */}
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            width: '20px'
          }}
          animate={showMenu ? "open" : "closed"}
        >
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 6 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -6 }
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        
        {/* Menu Text dengan animasi berganti */}
        <div
          style={{
            fontSize: '1.1rem',
            fontWeight: '300',
            minWidth: '90px',
            textAlign: 'center',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={menuText}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {menuText}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* High-Speed Text Scroll Loading Animation */}
      <AnimatePresence>
        {showLoading && (
          <div
            ref={loadingRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              zIndex: zIndexes.loading,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Text Scroll Container */}
            <div
              ref={textScrollRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0rem'
              }}
            >
              {/* High-speed scrolling text lines */}
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                CREATIVE
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                PORTFOLIO
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                INNOVATION
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                DESIGN
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                VISION
              </div>
              
              {/* Final text that stays */}
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: '#CCFF00',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0,
                textShadow: '0 0 30px rgba(204, 255, 0, 0.5)'
              }}>
                WELCOME
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content After Loading */}
      <AnimatePresence>
        {!showLoading && (
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '2rem',
              zIndex: 10
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '300',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textAlign: 'center',
                marginBottom: '0.5rem',
                letterSpacing: '2px'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              WELCOME
            </motion.h1>
            
            <motion.p
              style={{
                fontSize: '1rem',
                fontWeight: '300',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Arame Mono, monospace',
                textAlign: 'center',
                maxWidth: '400px',
                lineHeight: '1.5',
                letterSpacing: '0.5px'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Your space for creative thoughts and ideas
            </motion.p>

            <motion.button
              onClick={navigateToNotes}
              style={{
                padding: '0.8rem 1.8rem',
                fontSize: '0.9rem',
                fontWeight: '300',
                color: 'black',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                letterSpacing: '1px'
              }}
              whileHover={{ 
                scale: 1.03,
                backgroundColor: '#f8f8f8',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              VIEW NOTES
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>




// PERBAIKAN: Menu Overlay - BACKGROUND SOLID TANPA TRANSPARANSI
<AnimatePresence>
  {showMenu && (
    <>
      {/* Menu Content dengan Background SOLID - MENUTUPI SEMUA KONTEN */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#FF4444', // Background merah SOLID
          zIndex: zIndexes.menu,
          display: 'flex',
          padding: '2rem',
        }}
        variants={menuVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        {/* Main Content - Navigation Menu - FULL WIDTH */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '4rem',
          position: 'relative'
        }}>
          {/* Website Name - Top Left */}
          <motion.div
            style={{
              position: 'absolute',
              left: '2rem',
              top: '2rem',
              fontSize: '4rem',
              fontWeight: '800',
              color: 'rgba(255,255,255,1)',
              fontFamily: 'Arame Mono, monospace',
              lineHeight: 1,
              letterSpacing: '1.5px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              delay: 0.3
            }}
          >
            MENURU
          </motion.div>

          {/* Visitor Time & Location Display - TOP CENTER */}
          <motion.div
            style={{
              position: 'absolute',
              top: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            variants={timeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Time - Font Besar */}
            <motion.div
              style={{
                fontSize: '2.5rem',
                fontWeight: '400',
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'Arame Mono, monospace',
                fontFeatureSettings: '"tnum"',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '2px'
              }}
              animate={{
                scale: [1, 1.02, 1],
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            >
              {visitorTime.time}
            </motion.div>

            {/* Location & Timezone */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.9rem',
                fontWeight: '400',
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'Arame Mono, monospace'
              }}
            >
              <span style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                {visitorTime.timezone}
              </span>
              <span>
                {visitorLocation.city ? `${visitorLocation.city}, ${visitorLocation.country}` : 'Lokasi belum diatur'}
              </span>
            </motion.div>

            {/* Date */}
            <motion.div
              style={{
                fontSize: '0.8rem',
                fontWeight: '300',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Arame Mono, monospace'
              }}
            >
              {visitorTime.date}
            </motion.div>
          </motion.div>

          {/* Menu Items */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.name}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0.5rem 0'
                }}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                variants={menuItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
                custom={index}
                whileHover={{
                  x: 15,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                onClick={() => {
                  item.action();
                  setShowMenu(false); // Tutup menu setelah klik
                }}
              >
                {/* Menu Text dengan font besar 80px */}
                <motion.div
                  style={{
                    fontSize: '80px',
                    fontWeight: '300',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Arame Mono, monospace',
                    lineHeight: 1,
                    letterSpacing: '-2px',
                    textTransform: 'uppercase',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}
                  animate={{
                    color: hoveredItem === item.name ? '#FFFFFF' : 'rgba(255,255,255,0.8)',
                    transition: { duration: 0.2 }
                  }}
                >
                  {item.name}
                  
                  {/* Line bawah - TETAP ADA TANPA HOVER */}
                  <motion.div
                    style={{
                      width: '100%',
                      height: '3px',
                      backgroundColor: hoveredItem === item.name ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    animate={{
                      backgroundColor: hoveredItem === item.name ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                      height: hoveredItem === item.name ? '4px' : '3px'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Close Button */}
      <motion.button
        onClick={toggleMenu}
        onMouseEnter={() => setIsCloseHovered(true)}
        onMouseLeave={() => setIsCloseHovered(false)}
        style={{
          position: 'fixed',
          top: '1.8rem',
          right: '1.8rem',
          width: '100px',
          height: '45px',
          borderRadius: '25px',
          border: 'none',
          backgroundColor: 'rgba(255,255,255,0.2)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: zIndexes.menu + 10,
          backdropFilter: 'blur(10px)',
          padding: '0 1.5rem',
          fontFamily: 'Arame Mono, monospace',
          fontSize: '0.9rem',
          fontWeight: '300',
          color: 'rgba(255,255,255,0.9)',
          overflow: 'hidden'
        }}
        variants={closeButtonVariants}
        initial="closed"
        animate="open"
        exit="closed"
        whileHover={{ 
          scale: 1.05,
          backgroundColor: 'rgba(255,255,255,0.3)',
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          {/* X Icon */}
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ 
              scale: isCloseHovered ? 0 : 1,
              opacity: isCloseHovered ? 0 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </motion.svg>

          {/* Close Text */}
          <motion.span
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              fontWeight: '300',
              letterSpacing: '0.5px'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isCloseHovered ? 1 : 0,
              opacity: isCloseHovered ? 1 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            CLOSE
          </motion.span>
        </motion.div>
      </motion.button>
    </>
  )}
</AnimatePresence>





      

      {/* Modal untuk set lokasi manual */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: zIndexes.modal,
              padding: '2rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 style={{ 
                marginBottom: '1.5rem', 
                color: 'black',
                fontFamily: 'Arame Mono, monospace',
                fontWeight: '400'
              }}>
                Set Lokasi Anda
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Cari kota atau provinsi..."
                  value={tempLocation.city}
                  onChange={(e) => setTempLocation(prev => ({ ...prev, city: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontFamily: 'Arame Mono, monospace',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                maxHeight: '300px',
                marginBottom: '1.5rem'
              }}>
                {filteredCities.slice(0, 10).map((city, index) => (
                  <motion.div
                    key={`${city.city}-${city.region}`}
                    onClick={() => {
                      setTempLocation({
                        city: city.city,
                        region: city.region
                      });
                    }}
                    style={{
                      padding: '0.8rem',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      backgroundColor: tempLocation.city === city.city ? '#f8f8f8' : 'transparent',
                      fontFamily: 'Arame Mono, monospace',
                      fontSize: '0.9rem'
                    }}
                    whileHover={{ backgroundColor: '#f0f0f0' }}
                  >
                    <div style={{ fontWeight: '500', color: 'black' }}>{city.city}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{city.region}</div>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <motion.button
                  onClick={() => setShowLocationModal(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: '1px solid #ddd',
                    background: 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Arame Mono, monospace'
                  }}
                  whileHover={{ background: '#f8f8f8' }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={saveManualLocation}
                  disabled={!tempLocation.city}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: 'none',
                    background: tempLocation.city ? '#FF4444' : '#ccc',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: tempLocation.city ? 'pointer' : 'not-allowed',
                    fontFamily: 'Arame Mono, monospace',
                    fontWeight: '500'
                  }}
                  whileHover={tempLocation.city ? { scale: 1.05 } : {}}
                >
                  Simpan
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal untuk menampilkan semua users */}
      <AnimatePresence>
        {showAllUsers && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: zIndexes.modal,
              padding: '2rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  color: 'black',
                  fontFamily: 'Arame Mono, monospace',
                  fontWeight: '400',
                  margin: 0
                }}>
                  All Users Location Data
                </h3>
                <motion.button
                  onClick={() => setShowAllUsers(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  whileHover={{ 
                    backgroundColor: '#f0f0f0',
                    color: '#000'
                  }}
                >
                  ×
                </motion.button>
              </div>

              {isLoadingAllUsers ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '3rem',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <motion.div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #f0f0f0',
                      borderTop: '3px solid #FF4444',
                      borderRadius: '50%'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <div style={{
                    fontFamily: 'Arame Mono, monospace',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Loading users data...
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    maxHeight: '400px',
                    marginBottom: '1rem'
                  }}>
                    {allUsersData.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#666',
                        fontFamily: 'Arame Mono, monospace'
                      }}>
                        No users data found
                      </div>
                    ) : (
                      allUsersData.map((user, index) => (
                        <motion.div
                          key={user.id}
                          style={{
                            padding: '1.2rem',
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: user.id === currentUserId ? '#f8f8f8' : 'transparent',
                            fontFamily: 'Arame Mono, monospace',
                            borderLeft: user.id === currentUserId ? '4px solid #FF4444' : '4px solid transparent'
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ backgroundColor: '#fafafa' }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.8rem'
                          }}>
                            <div style={{ 
                              fontWeight: '500', 
                              color: 'black',
                              fontSize: '1rem'
                            }}>
                              User {index + 1} 
                              {user.id === currentUserId && (
                                <span style={{ 
                                  marginLeft: '0.5rem',
                                  backgroundColor: '#FF4444',
                                  color: 'white',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '12px',
                                  fontSize: '0.7rem',
                                  fontWeight: '500'
                                }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ 
                              fontSize: '0.7rem', 
                              color: '#666',
                              backgroundColor: '#f0f0f0',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '8px',
                              fontFamily: 'monospace'
                            }}>
                              ID: {user.id.substring(0, 10)}...
                            </div>
                          </div>
                          
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '0.5rem'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: '500' }}>
                              {user.city || 'Unknown'}, {user.region || 'Unknown'}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '0.5rem'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                              {user.lastUpdated ? new Date(user.lastUpdated).toLocaleString('id-ID') : 'No timestamp'}
                            </span>
                          </div>

                          {user.isManual && (
                            <div style={{ 
                              fontSize: '0.7rem', 
                              color: '#FF4444',
                              backgroundColor: 'rgba(255, 68, 68, 0.1)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '8px',
                              display: 'inline-block',
                              marginTop: '0.3rem'
                            }}>
                              Manual Location
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div style={{ 
                    marginTop: '1rem',
                    fontSize: '0.8rem',
                    color: '#666',
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#f8f8f8',
                    borderRadius: '8px'
                  }}>
                    Total <strong>{allUsersData.length}</strong> users found
                    {allUsersData.length > 0 && (
                      <span style={{ marginLeft: '1rem' }}>
                        • Last updated: {new Date().toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}










