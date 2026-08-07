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
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
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

const EditIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 3.5L20.5 7.5L7 21L3 21L3 17L16.5 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {open ? (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
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

// ===== DATA DEFAULT KETENTUAN =====
const defaultTerms = [
  {
    id: 1,
    title: "Pasal 1: Definisi",
    content: "Dalam Ketentuan Layanan ini, yang dimaksud dengan: 'Kami' adalah Menuru, 'Anda' adalah pengguna layanan, 'Layanan' adalah semua fitur yang disediakan oleh Menuru."
  },
  {
    id: 2,
    title: "Pasal 2: Penerimaan Ketentuan",
    content: "Dengan menggunakan Layanan Menuru, Anda dianggap telah membaca, memahami, dan menyetujui semua ketentuan yang tercantum dalam dokumen ini. Jika Anda tidak menyetujui, Anda tidak diperkenankan menggunakan Layanan."
  },
  {
    id: 3,
    title: "Pasal 3: Pendaftaran Akun",
    content: "Anda wajib mendaftar dengan data yang benar dan akurat. Anda bertanggung jawab penuh atas keamanan akun dan segala aktivitas yang terjadi di dalamnya."
  },
  {
    id: 4,
    title: "Pasal 4: Kewajiban Pengguna",
    content: "Pengguna dilarang menggunakan Layanan untuk tujuan ilegal, mengganggu keamanan, menyebarkan konten negatif, atau merugikan pihak lain. Pelanggaran akan dikenai sanksi sesuai ketentuan yang berlaku."
  },
  {
    id: 5,
    title: "Pasal 5: Hak Kekayaan Intelektual",
    content: "Seluruh konten dan merek yang ada di Layanan adalah milik Menuru dan dilindungi oleh undang-undang hak cipta. Pengguna tidak diperbolehkan menyalin, menyebarluaskan, atau memodifikasi tanpa izin tertulis."
  },
  {
    id: 6,
    title: "Pasal 6: Perubahan Ketentuan",
    content: "Kami berhak mengubah Ketentuan Layanan ini setiap saat. Perubahan akan diumumkan melalui Layanan dan berlaku efektif sejak tanggal pengumuman."
  },
  {
    id: 7,
    title: "Pasal 7: Penangguhan dan Penghapusan Akun",
    content: "Kami berhak menangguhkan atau menghapus akun Anda jika terjadi pelanggaran ketentuan. Keputusan kami bersifat final dan tidak dapat diganggu gugat."
  },
  {
    id: 8,
    title: "Pasal 8: Penyelesaian Sengketa",
    content: "Segala sengketa yang timbul akan diselesaikan secara musyawarah. Jika tidak mencapai kesepakatan, penyelesaian dilakukan melalui pengadilan yang berwenang di wilayah Indonesia."
  },
  {
    id: 9,
    title: "Pasal 9: Privasi dan Perlindungan Data",
    content: "Kami melindungi data pribadi Anda sesuai dengan Kebijakan Privasi yang terpisah. Data Anda tidak akan dijual atau disebarkan kepada pihak ketiga tanpa persetujuan."
  },
  {
    id: 10,
    title: "Pasal 10: Ketentuan Lain",
    content: "Ketentuan ini dibuat dalam bahasa Indonesia dan apabila terjadi perbedaan penafsiran, versi bahasa Indonesia yang berlaku."
  }
];

export default function TermsPage() {
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
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [termsData, setTermsData] = useState(defaultTerms);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ===== STATE SANDI =====
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [isPasswordSet, setIsPasswordSet] = useState<boolean>(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [pendingEditId, setPendingEditId] = useState<number | null>(null);

  const router = useRouter();

  // ===== AUTH =====
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ===== LOAD TERMS & ADMIN PASSWORD =====
  useEffect(() => {
    if (!db) return;
    // Load terms
    const termsRef = doc(db, "terms", "main");
    const unsubTerms = onSnapshot(termsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.content) {
          setTermsData(data.content);
        }
      } else {
        setDoc(termsRef, { content: defaultTerms }).catch(console.error);
      }
    }, console.error);

    // Load admin password
    const adminRef = doc(db, "admin", "settings");
    const unsubPassword = onSnapshot(adminRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.password) {
          setAdminPassword(data.password);
          setIsPasswordSet(true);
        } else {
          setIsPasswordSet(false);
        }
      } else {
        setIsPasswordSet(false);
      }
    }, console.error);

    return () => {
      unsubTerms();
      unsubPassword();
    };
  }, []);

  // ===== ROLLING TEXT =====
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

  // ===== SEARCH EXPAND =====
  useEffect(() => {
    if (isSearchOpen && searchExpandedRef.current) {
      gsap.fromTo(searchExpandedRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isSearchOpen]);

  // ===== CLICK OUTSIDE =====
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

  // ===== TOGGLE SECTION (GSAP) =====
  const toggleSection = (id: number, contentRef: React.RefObject<HTMLDivElement>) => {
    if (!contentRef.current) return;
    const isOpen = contentRef.current.style.height !== '0px' && contentRef.current.style.height !== '';
    if (isOpen) {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          contentRef.current!.style.display = 'none';
        }
      });
    } else {
      contentRef.current.style.display = 'block';
      const contentHeight = contentRef.current.scrollHeight;
      gsap.fromTo(contentRef.current,
        { height: 0, opacity: 0 },
        { height: contentHeight, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  };

  // ===== EDIT SECTION =====
  const handleEdit = (id: number) => {
    if (!isAdmin) return;
    const section = termsData.find(t => t.id === id);
    if (section) {
      setEditingSection(id);
      setEditContent(section.content);
      // If password not set, show set password modal first
      if (!isPasswordSet) {
        setShowSetPasswordModal(true);
        return;
      }
      // If password set, show verify modal
      setShowPasswordInput(true);
      setVerifyPassword("");
      setVerifyError("");
      setPendingEditId(id);
    }
  };

  // ===== SET PASSWORD =====
  const handleSetPassword = async () => {
    if (newPassword.length !== 6 || !/^\d{6}$/.test(newPassword)) {
      setPasswordError("Sandi harus 6 digit angka.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Sandi tidak sama.");
      return;
    }
    setPasswordError("");
    setIsSaving(true);
    try {
      const adminRef = doc(db!, "admin", "settings");
      await setDoc(adminRef, { password: newPassword }, { merge: true });
      setAdminPassword(newPassword);
      setIsPasswordSet(true);
      setShowSetPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving password:", error);
      setPasswordError("Gagal menyimpan sandi. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // ===== VERIFY PASSWORD =====
  const handleVerifyPassword = () => {
    if (verifyPassword === adminPassword) {
      setVerifyError("");
      setShowPasswordInput(false);
      setVerifyPassword("");
      // Proceed to save edit (will be called from save function)
      // We'll set editingSection and trigger save
      const section = termsData.find(t => t.id === pendingEditId);
      if (section) {
        setEditingSection(pendingEditId);
        setEditContent(section.content);
      }
      setPendingEditId(null);
    } else {
      setVerifyError("Sandi salah. Silakan coba lagi.");
    }
  };

  // ===== SAVE EDIT =====
  const handleSaveEdit = async () => {
    if (editContent.trim() === '') return;
    setIsSaving(true);
    try {
      const updated = termsData.map(t => 
        t.id === editingSection ? { ...t, content: editContent } : t
      );
      const docRef = doc(db!, "terms", "main");
      await setDoc(docRef, { content: updated }, { merge: true });
      setTermsData(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setEditingSection(null);
      setEditContent("");
    } catch (error) {
      console.error("Save error:", error);
      setPasswordError("Gagal menyimpan. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // ===== LOGOUT =====
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ===== SECTION COMPONENT =====
  const SectionItem = ({ item, isAdmin }: { item: typeof defaultTerms[0], isAdmin: boolean }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
      setIsOpen(!isOpen);
      toggleSection(item.id, contentRef);
    };

    return (
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
        <div 
          onClick={handleToggle}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          <h3 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#0D3CFC',
            fontFamily: FONT_FAMILY,
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {item.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(item.id); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#0D3CFC',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <EditIcon size={20} />
              </button>
            )}
            <span style={{
              fontSize: '24px',
              color: '#0D3CFC',
              transition: 'transform 0.3s ease',
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
              display: 'inline-block',
            }}>
              +
            </span>
          </div>
        </div>
        <div
          ref={contentRef}
          style={{
            overflow: 'hidden',
            height: 0,
            opacity: 0,
            display: 'none',
            paddingTop: '8px',
          }}
        >
          <div style={{
            fontSize: '22px',
            lineHeight: 1.6,
            color: '#333',
            fontFamily: FONT_FAMILY,
            padding: '8px 4px',
          }}>
            {item.content}
          </div>
          {editingSection === item.id && (
            <div style={{ marginTop: '12px' }}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #0D3CFC',
                  borderRadius: '8px',
                  fontSize: '20px',
                  fontFamily: FONT_FAMILY,
                  minHeight: '120px',
                  outline: 'none',
                  background: '#fafafa',
                  color: '#000',
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: isSaving ? '#ccc' : '#0D3CFC',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingSection(null);
                    setEditContent('');
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: FONT_FAMILY,
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_FAMILY }}>
        <div style={{ fontSize: '18px', color: '#000' }}>Loading...</div>
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
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        margin: 0,
        padding: 0,
        position: 'relative',
        fontFamily: FONT_FAMILY,
        overflowX: 'hidden',
        overflowY: 'auto',
      }}>
        {/* BANNER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            backgroundColor: '#0D3CFC',
            padding: '14px 20px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: 'none',
            gap: '20px',
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
                fontSize: '24px',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: FONT_FAMILY,
                letterSpacing: '-0.01em',
                textAlign: 'center',
              }}
            >
              Website sedang dalam pengembangan, Terima kasih
            </motion.span>
          </AnimatePresence>
          <div style={{
            backgroundColor: '#EB2227',
            padding: '6px 16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', fontFamily: FONT_FAMILY, letterSpacing: '-0.01em' }}>
              #lifeatmenuru
            </span>
          </div>
        </motion.div>

        {/* ===== HEADER ===== */}
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '40px',
          right: '40px',
          zIndex: 15,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" passHref style={{ textDecoration: 'none' }}>
              <motion.a
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#000000',
                  fontFamily: FONT_FAMILY,
                  letterSpacing: '-0.03em',
                  background: 'transparent',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Menuru
              </motion.a>
            </Link>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              ref={searchContainerRef}
              style={{ position: 'relative' }}
            >
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#0D3CFC',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  border: 'none',
                  position: 'relative',
                  minWidth: '240px',
                  width: '240px',
                  boxShadow: '0 2px 12px rgba(13,60,252,0.2)',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(13,60,252,0.3)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={() => {
                  if (!isSearchOpen) {
                    setIsSearchOpen(true);
                    setSearchQuery('');
                    setSearchResults([]);
                  }
                }}
              >
                {!isSearchOpen ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    color: '#ffffff',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <SearchIcon size={18} />
                      <span ref={rollingRef} style={{ color: '#ffffff', fontWeight: 400, display: 'inline-block', fontSize: '14px', fontFamily: FONT_FAMILY }}>
                        {rollingText}
                      </span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 300 }}>
                      ⌘K
                    </span>
                  </div>
                ) : null}
              </motion.div>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    ref={searchExpandedRef}
                    initial={{ height: 0, opacity: 0, y: -10 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'power2.out' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: '-400px',
                      backgroundColor: '#0D3CFC',
                      borderRadius: '16px',
                      padding: '32px 36px',
                      minWidth: '700px',
                      width: '700px',
                      minHeight: '500px',
                      boxShadow: '0 20px 80px rgba(13,60,252,0.4)',
                      overflow: 'hidden',
                      zIndex: 100,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      marginBottom: '24px',
                      borderBottom: '1px solid rgba(255,255,255,0.15)',
                      paddingBottom: '16px',
                    }}>
                      <SearchIcon size={24} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder=""
                        style={{
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          fontSize: '20px',
                          fontFamily: FONT_FAMILY,
                          padding: '8px 0',
                          width: '100%',
                          color: '#ffffff',
                          fontWeight: 400,
                        }}
                      />
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.5)',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '200px' }}>
                      <div style={{ color: '#ffffff', fontSize: '16px', fontFamily: FONT_FAMILY, padding: '30px 0', textAlign: 'center', fontWeight: 400 }}>
                        Tidak ada hasil
                      </div>
                    </div>
                    <div style={{
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: FONT_FAMILY }}>
                        ESC untuk keluar
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              padding: '0 20px',
            }}
          >
            <span style={{ fontSize: '29px', fontWeight: 500, color: '#000000', fontFamily: FONT_FAMILY, letterSpacing: '-0.02em' }}>Note</span>
            <span style={{ fontSize: '29px', fontWeight: 500, color: '#000000', fontFamily: FONT_FAMILY, letterSpacing: '-0.02em' }}>Donations</span>
            <span style={{ fontSize: '29px', fontWeight: 500, color: '#000000', fontFamily: FONT_FAMILY, letterSpacing: '-0.02em' }}>News</span>
            <span style={{ fontSize: '29px', fontWeight: 500, color: '#000000', fontFamily: FONT_FAMILY, letterSpacing: '-0.02em' }}>Calendar</span>
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/shop" passHref style={{ textDecoration: 'none' }}>
              <motion.a
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                  padding: '8px 12px',
                  borderRadius: '30px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <StoreIcon size={22} />
                <span>Shop</span>
              </motion.a>
            </Link>

            <Link href="/pusat-bantuan" passHref style={{ textDecoration: 'none' }}>
              <motion.a
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                  padding: '8px 12px',
                  borderRadius: '30px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <HelpDeskIcon size={22} />
                <span>Pusat bantuan</span>
              </motion.a>
            </Link>

            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#000000',
                  padding: '8px 8px',
                  borderRadius: '8px',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <NotificationsIcon size={24} hasBadge={false} />
              </motion.button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '320px',
                      maxWidth: '380px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      zIndex: 60,
                      fontFamily: FONT_FAMILY,
                      padding: '12px 0',
                    }}
                  >
                    <div style={{ padding: '0 16px 8px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: '14px', color: '#000' }}>
                      Notifikasi
                    </div>
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                      Tidak ada notifikasi
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ position: 'relative' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {user.photoURL && (
                    <img src={user.photoURL} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                  )}
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#000', fontFamily: FONT_FAMILY }}>
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: FONT_FAMILY,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/signin" passHref style={{ textDecoration: 'none' }}>
                  <motion.a
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '30px',
                      backgroundColor: 'transparent',
                      color: '#000000',
                      fontSize: '16px',
                      fontWeight: 500,
                      fontFamily: FONT_FAMILY,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserAvatarIcon size={22} />
                    <span>Login</span>
                  </motion.a>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ===== KONTEN UTAMA ===== */}
        <div style={{
          marginTop: '180px',
          padding: '0 40px 80px',
          width: '100%',
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          flexDirection: 'row',
          gap: '80px',
          alignItems: 'flex-start',
          minHeight: 'calc(100vh - 260px)',
          justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'power2.out' }}
            style={{
              flex: '0 0 60%',
              maxWidth: '800px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h1 style={{
                fontSize: '180px',
                fontWeight: 700,
                color: '#0D3CFC',
                fontFamily: FONT_FAMILY,
                letterSpacing: '-0.05em',
                lineHeight: 1,
                margin: 0,
                textAlign: 'left',
                wordBreak: 'break-word',
              }}>
                Ketentuan Layanan
              </h1>
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSetPasswordModal(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isPasswordSet ? '#d1fae5' : '#fef3c7',
                    color: isPasswordSet ? '#065f46' : '#92400e',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isPasswordSet ? '🔒 Ganti Sandi' : '🔑 Atur Sandi'}
                </motion.button>
              )}
            </div>

            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: FONT_FAMILY,
                  marginBottom: '20px',
                  border: '1px solid #a7f3d0',
                }}
              >
                ✅ Perubahan berhasil disimpan!
              </motion.div>
            )}

            {termsData.map((item) => (
              <SectionItem key={item.id} item={item} isAdmin={isAdmin} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'power2.out' }}
            style={{
              flex: '1',
              display: 'block',
            }}
          />
        </div>

        {/* ===== MODAL SET PASSWORD ===== */}
        <AnimatePresence>
          {showSetPasswordModal && (
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
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
              onClick={() => setShowSetPasswordModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '40px',
                  maxWidth: '420px',
                  width: '90%',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  fontFamily: FONT_FAMILY,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#0D3CFC', margin: '0 0 8px 0', fontFamily: FONT_FAMILY }}>
                  {isPasswordSet ? 'Ganti Sandi' : 'Atur Sandi'}
                </h2>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px', fontFamily: FONT_FAMILY }}>
                  Masukkan sandi 6 digit untuk keamanan.
                </p>
                <input
                  type="password"
                  maxLength={6}
                  value={newPassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setNewPassword(val);
                    setPasswordError('');
                  }}
                  placeholder="6 digit angka"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: `2px solid ${passwordError ? '#ef4444' : '#e8e8e8'}`,
                    borderRadius: '12px',
                    fontSize: '20px',
                    fontFamily: FONT_FAMILY,
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    background: '#fafafa',
                    transition: 'border-color 0.3s ease',
                    marginBottom: '16px',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                  autoFocus
                />
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setConfirmPassword(val);
                    setPasswordError('');
                  }}
                  placeholder="Konfirmasi sandi"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: `2px solid ${passwordError ? '#ef4444' : '#e8e8e8'}`,
                    borderRadius: '12px',
                    fontSize: '20px',
                    fontFamily: FONT_FAMILY,
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    background: '#fafafa',
                    transition: 'border-color 0.3s ease',
                    marginBottom: '16px',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                />
                {passwordError && (
                  <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 16px 0', fontFamily: FONT_FAMILY }}>
                    {passwordError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSetPassword}
                    disabled={isSaving || newPassword.length !== 6 || confirmPassword.length !== 6}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: (isSaving || newPassword.length !== 6 || confirmPassword.length !== 6) ? '#ccc' : '#0D3CFC',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '18px',
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      cursor: (isSaving || newPassword.length !== 6 || confirmPassword.length !== 6) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowSetPasswordModal(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
                    style={{
                      padding: '14px 24px',
                      backgroundColor: 'transparent',
                      color: '#666',
                      border: '1px solid #ccc',
                      borderRadius: '10px',
                      fontSize: '18px',
                      fontFamily: FONT_FAMILY,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Batal
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== MODAL VERIFY PASSWORD ===== */}
        <AnimatePresence>
          {showPasswordInput && (
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
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
              onClick={() => {
                setShowPasswordInput(false);
                setVerifyPassword('');
                setVerifyError('');
                setPendingEditId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '40px',
                  maxWidth: '420px',
                  width: '90%',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  fontFamily: FONT_FAMILY,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#0D3CFC', margin: '0 0 8px 0', fontFamily: FONT_FAMILY }}>
                  Verifikasi Sandi
                </h2>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px', fontFamily: FONT_FAMILY }}>
                  Masukkan sandi 6 digit untuk mengedit konten.
                </p>
                <input
                  type="password"
                  maxLength={6}
                  value={verifyPassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setVerifyPassword(val);
                    setVerifyError('');
                  }}
                  placeholder="6 digit angka"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: `2px solid ${verifyError ? '#ef4444' : '#e8e8e8'}`,
                    borderRadius: '12px',
                    fontSize: '20px',
                    fontFamily: FONT_FAMILY,
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    background: '#fafafa',
                    transition: 'border-color 0.3s ease',
                    marginBottom: '16px',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                  autoFocus
                />
                {verifyError && (
                  <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 16px 0', fontFamily: FONT_FAMILY }}>
                    {verifyError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerifyPassword}
                    disabled={verifyPassword.length !== 6}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: verifyPassword.length !== 6 ? '#ccc' : '#0D3CFC',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '18px',
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      cursor: verifyPassword.length !== 6 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Verifikasi
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowPasswordInput(false);
                      setVerifyPassword('');
                      setVerifyError('');
                      setPendingEditId(null);
                    }}
                    style={{
                      padding: '14px 24px',
                      backgroundColor: 'transparent',
                      color: '#666',
                      border: '1px solid #ccc',
                      borderRadius: '10px',
                      fontSize: '18px',
                      fontFamily: FONT_FAMILY,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Batal
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
