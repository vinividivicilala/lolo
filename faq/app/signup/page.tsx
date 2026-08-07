'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import gsap from 'gsap';

// Firebase Config
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

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

// ===== ICONS =====
const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 3.5L20.5 7.5L7 21L3 21L3 17L16.5 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShopIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7L4 20H20L21 7H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 7L8 4H16L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const HelpDeskIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 15C5 13.8954 5.89543 13 7 13H8C9.10457 13 10 13.8954 10 15V17C10 18.1046 9.10457 19 8 19H7C5.89543 19 5 18.1046 5 17V15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M19 15C19 13.8954 18.1046 13 17 13H16C14.8954 13 14 13.8954 14 15V17C14 18.1046 14.8954 19 16 19H17C18.1046 19 19 18.1046 19 17V15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 13V11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UserAvatarIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const StoreIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7H20M4 7L3 12H21L20 7M4 7L5 20H19L20 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12V16H15V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NotificationsIcon = ({ size = 24, hasBadge = false }: { size?: number; hasBadge?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "relative" }}>
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {hasBadge && (
      <circle cx="19" cy="5" r="5" fill="#ef4444" stroke="white" strokeWidth="2"/>
    )}
  </svg>
);

// ===== SEARCH ROLLING TEXT =====
const searchRollingTexts = [
  "Tentang Note", 
  "Tentang Donasi", 
  "Tentang Blog", 
  "Tentang Shop", 
  "Tentang Pusat bantuan"
];

// ===== KOMPONEN KETENTUAN =====
const TermsSection = ({ 
  title, 
  content, 
  isOpen, 
  onToggle,
  index,
}: { 
  title: string; 
  content: string; 
  isOpen: boolean; 
  onToggle: () => void;
  index: number;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (contentRef.current && iconRef.current) {
      if (isOpen) {
        gsap.to(contentRef.current, {
          height: 'auto',
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        });
        gsap.to(iconRef.current, {
          rotate: 45,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        });
        gsap.to(iconRef.current, {
          rotate: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }
  }, [isOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      style={{
        borderBottom: '1px solid #f0f0f0',
        padding: '4px 0',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '12px 4px',
          transition: 'background 0.2s ease',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13,60,252,0.03)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{
          fontSize: '22px',
          fontWeight: 500,
          color: '#0D3CFC',
          fontFamily: FONT_FAMILY,
          letterSpacing: '-0.01em',
        }}>
          {title}
        </span>
        <span ref={iconRef} style={{
          fontSize: '28px',
          fontWeight: 300,
          color: '#0D3CFC',
          display: 'inline-block',
          transition: 'transform 0.3s ease',
        }}>
          +
        </span>
      </div>
      <div
        ref={contentRef}
        style={{
          height: 0,
          opacity: 0,
          overflow: 'hidden',
          paddingLeft: '4px',
        }}
      >
        <div style={{
          fontSize: '18px',
          color: '#333',
          fontFamily: FONT_FAMILY,
          lineHeight: 1.8,
          padding: '0 4px 16px 4px',
        }}>
          {content}
        </div>
      </div>
    </motion.div>
  );
};

// ===== KOMPONEN VERIFIKASI 6 DIGIT =====
const VerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerify,
  email,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onVerify: (code: string) => void;
  email: string;
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit jika semua terisi
    if (newCode.every(c => c !== '')) {
      setTimeout(() => onVerify(newCode.join('')), 300);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={onClose}
        >
          <div
            ref={modalRef}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              fontFamily: FONT_FAMILY,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(13,60,252,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0D3CFC" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                  <path d="M22 10L12 15L2 10" />
                </svg>
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#0D3CFC',
                fontFamily: FONT_FAMILY,
                margin: '0 0 4px 0',
              }}>
                Verifikasi Email
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#666',
                fontFamily: FONT_FAMILY,
                margin: '0',
              }}>
                Masukkan kode 6 digit yang dikirim ke
                <br />
                <strong style={{ color: '#0D3CFC' }}>{email}</strong>
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '32px',
            }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: '52px',
                    height: '64px',
                    textAlign: 'center',
                    fontSize: '28px',
                    fontWeight: 600,
                    fontFamily: FONT_FAMILY,
                    border: `2px solid ${digit ? '#0D3CFC' : '#e0e0e0'}`,
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    background: digit ? 'rgba(13,60,252,0.04)' : '#ffffff',
                    color: '#0D3CFC',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0D3CFC';
                    e.target.style.boxShadow = '0 0 0 4px rgba(13,60,252,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = digit ? '#0D3CFC' : '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  // Kirim ulang kode
                  alert('Kode verifikasi baru telah dikirim ke email Anda.');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0D3CFC',
                  fontSize: '14px',
                  fontFamily: FONT_FAMILY,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '8px',
                }}
              >
                Kirim ulang kode
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================
// ===== KOMPONEN UTAMA =====
// ============================================================
export default function KetentuanPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rollingIndex, setRollingIndex] = useState(0);
  const [rollingText, setRollingText] = useState(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const router = useRouter();

  // State untuk terms
  const [openSections, setOpenSections] = useState<number[]>([]);
  const [termsData, setTermsData] = useState([
    {
      id: 1,
      title: "1. Ketentuan Umum",
      content: "Ketentuan Layanan Menuru (\"Ketentuan\") ini mengatur penggunaan platform Menuru, termasuk semua fitur, layanan, dan konten yang tersedia. Dengan mengakses atau menggunakan platform Menuru, Anda menyetujui untuk terikat dengan Ketentuan ini. Jika Anda tidak setuju dengan Ketentuan ini, Anda tidak boleh menggunakan platform Menuru."
    },
    {
      id: 2,
      title: "2. Akun Pengguna",
      content: "Untuk menggunakan fitur tertentu, Anda harus membuat akun. Anda bertanggung jawab penuh atas semua aktivitas yang terjadi di bawah akun Anda. Anda setuju untuk memberikan informasi yang akurat dan terkini. Kami berhak untuk menangguhkan atau menghentikan akun Anda jika terjadi pelanggaran terhadap Ketentuan ini."
    },
    {
      id: 3,
      title: "3. Konten dan Hak Kekayaan Intelektual",
      content: "Semua konten yang tersedia di platform Menuru, termasuk teks, gambar, logo, dan perangkat lunak, dilindungi oleh hak cipta dan hak kekayaan intelektual lainnya. Anda tidak diperbolehkan untuk menyalin, mendistribusikan, atau menggunakan konten tanpa izin tertulis dari Menuru."
    },
    {
      id: 4,
      title: "4. Penggunaan yang Dilarang",
      content: "Dilarang menggunakan platform untuk tujuan ilegal, mengirimkan konten yang melanggar hukum, atau mengganggu fungsi platform. Kami berhak untuk menghapus konten yang dianggap melanggar dan mengambil tindakan hukum yang diperlukan."
    },
    {
      id: 5,
      title: "5. Privasi dan Data",
      content: "Kami mengumpulkan dan memproses data pribadi sesuai dengan Kebijakan Privasi kami. Anda setuju bahwa kami dapat menggunakan data Anda untuk meningkatkan layanan dan memberikan pengalaman yang lebih baik."
    },
    {
      id: 6,
      title: "6. Perubahan Ketentuan",
      content: "Kami dapat memperbarui Ketentuan ini sewaktu-waktu. Perubahan akan diberlakukan setelah dipublikasikan di platform. Anda diharapkan untuk memeriksa Ketentuan secara berkala."
    },
    {
      id: 7,
      title: "7. Penangguhan dan Penghentian",
      content: "Kami berhak untuk menangguhkan atau menghentikan akses Anda ke platform jika terjadi pelanggaran terhadap Ketentuan ini. Penghentian dapat dilakukan tanpa pemberitahuan sebelumnya."
    },
    {
      id: 8,
      title: "8. Hukum yang Berlaku",
      content: "Ketentuan ini diatur oleh hukum Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui pengadilan yang berwenang di Indonesia."
    }
  ]);

  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [authorEmail, setAuthorEmail] = useState<string>("");

  // Load terms dari Firestore
  const loadTermsFromFirestore = async () => {
    if (!db) return;
    try {
      const docRef = doc(db, "terms", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.terms) {
          setTermsData(data.terms);
        }
        setLastUpdate(data.lastUpdate || "");
        setAuthorName(data.authorName || "");
        setAuthorEmail(data.authorEmail || "");
      }
    } catch (error) {
      console.error("Error loading terms:", error);
    }
  };

  // Save terms ke Firestore
  const saveTermsToFirestore = async (newTerms: typeof termsData) => {
    if (!db || !isAdmin) return;
    try {
      const docRef = doc(db, "terms", "main");
      await setDoc(docRef, {
        terms: newTerms,
        lastUpdate: new Date().toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        authorName: user?.displayName || user?.email || "Admin",
        authorEmail: user?.email || "",
        updatedBy: user?.uid || "",
      });
      setTermsData(newTerms);
      setLastUpdate(new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
      setAuthorName(user?.displayName || user?.email || "Admin");
      setAuthorEmail(user?.email || "");
      setEditingSection(null);
    } catch (error) {
      console.error("Error saving terms:", error);
    }
  };

  // Toggle section
  const toggleSection = (index: number) => {
    setOpenSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Handle edit
  const handleEdit = (index: number) => {
    setEditingSection(index);
    setEditContent(termsData[index].content);
  };

  const handleSaveEdit = (index: number) => {
    const newTerms = [...termsData];
    newTerms[index].content = editContent;
    saveTermsToFirestore(newTerms);
  };

  // Handle submit (verifikasi)
  const handleSubmit = () => {
    setShowVerification(true);
  };

  const handleVerify = (code: string) => {
    console.log("Verification code:", code);
    setShowVerification(false);
    // Lanjutkan ke proses sign up
    alert("Verifikasi berhasil! Akun Anda telah dibuat.");
    router.push('/');
  };

  // Auth listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAdmin(currentUser.email === ADMIN_EMAIL);
        // Simpan user data ke Firestore
        try {
          const userRef = doc(db, "users", currentUser.uid);
          await setDoc(userRef, {
            name: currentUser.displayName || currentUser.email,
            email: currentUser.email,
            photoURL: currentUser.photoURL || "",
            lastLogin: serverTimestamp(),
          }, { merge: true });
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Load terms on mount
  useEffect(() => {
    loadTermsFromFirestore();
  }, []);

  // Rolling text
  useEffect(() => {
    let isForward = true;
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (isForward) {
        currentIndex++;
        if (currentIndex >= searchRollingTexts.length) {
          currentIndex = searchRollingTexts.length - 2;
          isForward = false;
        }
      } else {
        currentIndex--;
        if (currentIndex < 0) {
          currentIndex = 1;
          isForward = true;
        }
      }
      if (currentIndex >= 0 && currentIndex < searchRollingTexts.length) {
        setRollingIndex(currentIndex);
        setRollingText(searchRollingTexts[currentIndex]);
        if (rollingRef.current) {
          gsap.fromTo(rollingRef.current,
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
          );
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Search expand
  useEffect(() => {
    if (isSearchOpen && searchExpandedRef.current) {
      gsap.fromTo(searchExpandedRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isSearchOpen]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchResults([]);
  }, [searchQuery]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", fontFamily: FONT_FAMILY }}>
        <div style={{ fontSize: "18px", color: "#000", fontFamily: FONT_FAMILY }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Ketentuan Layanan | Menuru</title>
        <meta name="description" content="Ketentuan Layanan Menuru" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
      </Head>

      <style jsx global>{`
        body {
          overflow-y: scroll;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }
        body::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: FONT_FAMILY,
        overflowX: "hidden",
        overflowY: "auto",
      }}>
        {/* BANNER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            backgroundColor: "#0D3CFC",
            padding: "14px 20px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "none",
            gap: "20px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={0}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "#ffffff",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}
            >
              Website sedang dalam pengembangan, Terima kasih
            </motion.span>
          </AnimatePresence>
          <div
            style={{
              backgroundColor: "#EB2227",
              padding: "6px 16px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.01em",
              }}
            >
              #lifeatmenuru
            </span>
          </div>
        </motion.div>

        {/* ===== HEADER ===== */}
        <div style={{
          position: "absolute",
          top: "80px",
          left: "40px",
          right: "40px",
          zIndex: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* KIRI: Menuru + Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/" passHref style={{ textDecoration: "none" }}>
              <motion.a
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#000000",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.03em",
                  background: "transparent",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Menuru
              </motion.a>
            </Link>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              ref={searchContainerRef}
              style={{ position: "relative" }}
            >
              <motion.div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#0D3CFC",
                  borderRadius: "12px",
                  padding: "4px 8px",
                  border: "none",
                  position: "relative",
                  minWidth: "240px",
                  width: "240px",
                  boxShadow: "0 2px 12px rgba(13,60,252,0.2)",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(13,60,252,0.3)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => {
                  if (!isSearchOpen) {
                    setIsSearchOpen(true);
                    setSearchQuery("");
                    setSearchResults([]);
                  }
                }}
              >
                {!isSearchOpen ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 16px",
                    color: "#ffffff",
                    width: "100%",
                    justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <SearchIcon size={18} />
                      <span 
                        ref={rollingRef}
                        style={{ 
                          color: "#ffffff",
                          fontWeight: 400,
                          display: "inline-block",
                          fontSize: "14px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {rollingText}
                      </span>
                    </div>
                    <span style={{ 
                      color: "rgba(255,255,255,0.4)", 
                      fontSize: "12px",
                      fontWeight: 300,
                    }}>
                      ⌘K
                    </span>
                  </div>
                ) : null}
              </motion.div>

              {/* Search Expanded */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    ref={searchExpandedRef}
                    initial={{ height: 0, opacity: 0, y: -10 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "power2.out" }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: "-400px",
                      backgroundColor: "#0D3CFC",
                      borderRadius: "16px",
                      padding: "32px 36px",
                      minWidth: "700px",
                      width: "700px",
                      minHeight: "500px",
                      boxShadow: "0 20px 80px rgba(13,60,252,0.4)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      marginBottom: "24px",
                      borderBottom: "1px solid rgba(255,255,255,0.15)",
                      paddingBottom: "16px",
                    }}>
                      <SearchIcon size={24} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder=""
                        style={{
                          border: "none",
                          outline: "none",
                          backgroundColor: "transparent",
                          fontSize: "20px",
                          fontFamily: FONT_FAMILY,
                          padding: "8px 0",
                          width: "100%",
                          color: "#ffffff",
                          fontWeight: 400,
                        }}
                      />
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "rgba(255,255,255,0.5)",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      minHeight: "200px",
                    }}>
                      <div style={{
                        color: "#ffffff",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                        padding: "30px 0",
                        textAlign: "center",
                        fontWeight: 400,
                      }}>
                        Tidak ada hasil
                      </div>
                    </div>

                    <div style={{
                      marginTop: "20px",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}>
                      <span style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                        fontFamily: FONT_FAMILY,
                      }}>
                        ESC untuk keluar
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* TENGAH: Note Donations News Calendar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              padding: "0 20px",
            }}
          >
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Note
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Donations
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              News
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Calendar
            </span>
          </motion.div>

          {/* KANAN: Shop + Pusat bantuan + Notif + Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/shop" passHref style={{ textDecoration: "none" }}>
              <motion.a
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                  padding: "8px 12px",
                  borderRadius: "30px",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <StoreIcon size={22} />
                <span>Shop</span>
              </motion.a>
            </Link>

            <Link href="/pusat-bantuan" passHref style={{ textDecoration: "none" }}>
              <motion.a
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                  padding: "8px 12px",
                  borderRadius: "30px",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <HelpDeskIcon size={22} />
                <span>Pusat bantuan</span>
              </motion.a>
            </Link>

            {/* Notification - Isi dihapus */}
            <div ref={notificationsRef} style={{ position: "relative" }}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#000000",
                  padding: "8px 8px",
                  borderRadius: "8px",
                  position: "relative",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <NotificationsIcon size={24} hasBadge={false} />
              </motion.button>
              {/* Notifikasi kosong */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      minWidth: "280px",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                      border: "1px solid rgba(0,0,0,0.04)",
                      zIndex: 60,
                      fontFamily: FONT_FAMILY,
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "14px", color: "#999" }}>
                      Tidak ada notifikasi
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div style={{ position: "relative" }}>
              {user ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 8px",
                  borderRadius: "30px",
                  backgroundColor: "transparent",
                }}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: "14px", fontFamily: FONT_FAMILY }}>
                      {user.displayName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>{user.displayName || user.email}</span>
                </div>
              ) : (
                <Link href="/signin" passHref style={{ textDecoration: "none" }}>
                  <motion.a
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      borderRadius: "30px",
                      backgroundColor: "transparent",
                      color: "#000000",
                      fontSize: "16px",
                      fontWeight: 500,
                      fontFamily: FONT_FAMILY,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <UserAvatarIcon size={22} />
                    <span>Login</span>
                  </motion.a>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ===== KONTEN KETENTUAN ===== */}
        <div style={{
          marginTop: "180px",
          padding: "0 40px 80px",
          width: "100%",
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{
              fontSize: "70px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 12px 0",
              textAlign: "left",
            }}>
              Ketentuan Layanan
            </h1>
            <p style={{
              fontSize: "18px",
              color: "#666",
              fontFamily: FONT_FAMILY,
              marginBottom: "8px",
              textAlign: "left",
            }}>
              Memahami hak dan kewajiban Anda
            </p>
            {lastUpdate && (
              <p style={{
                fontSize: "14px",
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                marginBottom: "8px",
                textAlign: "left",
              }}>
                Terakhir diperbarui: {lastUpdate}
              </p>
            )}
            {authorName && (
              <p style={{
                fontSize: "14px",
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                marginBottom: "32px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span>Author by</span>
                <span style={{ fontWeight: 600 }}>{authorName}</span>
                <span style={{ fontSize: "12px", color: "#666" }}>({authorEmail})</span>
              </p>
            )}
          </motion.div>

          {/* Daftar Ketentuan - tanpa bg, tanpa border box */}
          <div style={{
            marginTop: "8px",
          }}>
            {termsData.map((item, index) => (
              <TermsSection
                key={item.id}
                title={item.title}
                content={item.content}
                isOpen={openSections.includes(index)}
                onToggle={() => toggleSection(index)}
                index={index}
              />
            ))}
          </div>

          {/* Admin Edit */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: "40px",
                padding: "20px 0",
                borderTop: "1px solid #e8e8e8",
              }}
            >
              <h3 style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                marginBottom: "16px",
              }}>
                Edit Ketentuan (Admin)
              </h3>
              {editingSection !== null ? (
                <div>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    marginBottom: "8px",
                  }}>
                    {termsData[editingSection].title}
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "150px",
                      padding: "14px 18px",
                      border: "2px solid #0D3CFC",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontFamily: FONT_FAMILY,
                      outline: "none",
                      resize: "vertical",
                      color: "#333",
                      background: "#fafafa",
                    }}
                  />
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSaveEdit(editingSection)}
                      style={{
                        padding: "10px 28px",
                        backgroundColor: "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0a2fc9"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0D3CFC"}
                    >
                      Simpan
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditingSection(null)}
                      style={{
                        padding: "10px 28px",
                        backgroundColor: "transparent",
                        color: "#666",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Batal
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  {termsData.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        backgroundColor: "#f8f8f8",
                      }}
                    >
                      <span style={{
                        fontSize: "15px",
                        color: "#333",
                        fontFamily: FONT_FAMILY,
                      }}>
                        {item.title}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0D3CFC",
                          cursor: "pointer",
                          padding: "4px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <EditIcon size={16} />
                        <span>Edit</span>
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tombol Submit - Verifikasi */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                marginTop: "40px",
                paddingTop: "30px",
                borderTop: "1px solid #e8e8e8",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                style={{
                  padding: "14px 48px",
                  backgroundColor: "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  boxShadow: "0 4px 20px rgba(13,60,252,0.3)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0a2fc9"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0D3CFC"}
              >
                Verifikasi Akun
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Modal Verifikasi */}
        <VerificationModal
          isOpen={showVerification}
          onClose={() => setShowVerification(false)}
          onVerify={handleVerify}
          email={user?.email || "email@example.com"}
        />
      </div>
    </>
  );
}
