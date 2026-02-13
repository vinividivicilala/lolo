'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  where,
  addDoc,
  onSnapshot,
  increment
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

// Emoticon List untuk Reactions
const EMOTICONS = [
  { id: 'like', emoji: '👍', label: 'Suka', color: '#3b82f6' },
  { id: 'heart', emoji: '❤️', label: 'Cinta', color: '#ef4444' },
  { id: 'laugh', emoji: '😂', label: 'Lucu', color: '#f59e0b' },
  { id: 'wow', emoji: '😮', label: 'Kagum', color: '#8b5cf6' },
  { id: 'sad', emoji: '😢', label: 'Sedih', color: '#6b7280' },
  { id: 'angry', emoji: '😠', label: 'Marah', color: '#dc2626' },
  { id: 'fire', emoji: '🔥', label: 'Hebat', color: '#f97316' },
  { id: 'clap', emoji: '👏', label: 'Apresiasi', color: '#10b981' },
  { id: 'rocket', emoji: '🚀', label: 'Keren', color: '#a855f7' },
  { id: 'bulb', emoji: '💡', label: 'Inspiratif', color: '#eab308' },
  { id: 'coffee', emoji: '☕', label: 'Semangat', color: '#92400e' },
  { id: 'muscle', emoji: '💪', label: 'Kuat', color: '#b45309' }
];

export default function MemilihJurusanPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("pendahuluan");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Firebase State
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [firebaseDb, setFirebaseDb] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Reactions
  const [reactions, setReactions] = useState<{ [key: string]: number }>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [selectedCommentForReply, setSelectedCommentForReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // State untuk Comments
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  // Format tanggal
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // ============================================
  // DATA TAGS
  // ============================================
  const articleTags = [
    { id: 'jurusan', name: 'Jurusan' },
    { id: 'it', name: 'IT' },
    { id: 'karir', name: 'Karir' },
    { id: 'kuliah', name: 'Kuliah' },
    { id: 'gunadarma', name: 'Gunadarma' }
  ];

  // ============================================
  // 1. INITIALIZATION FIREBASE
  // ============================================
  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    try {
      const app = getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApps()[0];
      
      const auth = getAuth(app);
      const db = getFirestore(app);
      
      setFirebaseAuth(auth);
      setFirebaseDb(db);
      setFirebaseInitialized(true);
      
      // Initialize blog reactions document
      initializeBlogReactions(db);
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // ============================================
  // 2. INITIALIZE BLOG REACTIONS DOCUMENT
  // ============================================
  const initializeBlogReactions = async (db: any) => {
    try {
      const reactionsRef = doc(db, "blogReactions", "memilih-jurusan-article");
      const docSnap = await getDoc(reactionsRef);
      
      if (!docSnap.exists()) {
        // Initialize with zero counts for all emoticons
        const initialCounts: { [key: string]: number } = {};
        EMOTICONS.forEach(emoticon => {
          initialCounts[emoticon.id] = 0;
        });
        
        await setDoc(reactionsRef, {
          articleId: "memilih-jurusan-article",
          counts: initialCounts,
          createdAt: Timestamp.now()
        });
        console.log("Blog reactions document created");
      }
    } catch (error) {
      console.error("Error initializing blog reactions:", error);
    }
  };

  // ============================================
  // 3. AUTH STATE LISTENER
  // ============================================
  useEffect(() => {
    if (!firebaseAuth || !firebaseInitialized) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseAuth, firebaseInitialized]);

  // ============================================
  // 4. LOAD REACTIONS FROM FIREBASE (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const reactionsRef = doc(firebaseDb, "blogReactions", "memilih-jurusan-article");
    
    const unsubscribe = onSnapshot(reactionsRef, (doc) => {
      if (doc.exists()) {
        setReactions(doc.data().counts || {});
      }
    }, (error) => {
      console.error("Error loading reactions:", error);
    });

    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized]);

  // ============================================
  // 5. LOAD USER REACTIONS
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized || !user) return;

    const loadUserReactions = async () => {
      try {
        const userReactionsRef = doc(firebaseDb, "userReactions", `${user.uid}_memilih-jurusan-article`);
        const docSnap = await getDoc(userReactionsRef);
        if (docSnap.exists()) {
          setUserReactions(docSnap.data().reactions || []);
        } else {
          // Create user reactions document
          await setDoc(userReactionsRef, {
            userId: user.uid,
            articleId: "memilih-jurusan-article",
            reactions: [],
            createdAt: Timestamp.now()
          });
          setUserReactions([]);
        }
      } catch (error) {
        console.error("Error loading user reactions:", error);
      }
    };

    loadUserReactions();
  }, [firebaseDb, firebaseInitialized, user]);

  // ============================================
  // 6. LOAD COMMENTS FROM FIREBASE (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const commentsRef = collection(firebaseDb, "blogComments");
    const q = query(
      commentsRef, 
      where("articleId", "==", "memilih-jurusan-article"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        replies: doc.data().replies || []
      }));
      setComments(commentsData);
    }, (error) => {
      console.error("Error loading comments:", error);
    });

    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized]);

  // ============================================
  // 7. HANDLE REACTION (EMOTICON)
  // ============================================
  const handleReaction = async (emoticonId: string) => {
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb) return;

    try {
      const reactionsRef = doc(firebaseDb, "blogReactions", "memilih-jurusan-article");
      const userReactionsRef = doc(firebaseDb, "userReactions", `${user.uid}_memilih-jurusan-article`);

      // Ensure reactions document exists
      const reactionsDoc = await getDoc(reactionsRef);
      if (!reactionsDoc.exists()) {
        const initialCounts: { [key: string]: number } = {};
        EMOTICONS.forEach(emoticon => {
          initialCounts[emoticon.id] = 0;
        });
        await setDoc(reactionsRef, {
          articleId: "memilih-jurusan-article",
          counts: initialCounts,
          createdAt: Timestamp.now()
        });
      }

      if (userReactions.includes(emoticonId)) {
        // Remove reaction
        await updateDoc(reactionsRef, {
          [`counts.${emoticonId}`]: increment(-1)
        });
        await updateDoc(userReactionsRef, {
          reactions: arrayRemove(emoticonId)
        });
        setUserReactions(prev => prev.filter(id => id !== emoticonId));
      } else {
        // Add reaction
        await updateDoc(reactionsRef, {
          [`counts.${emoticonId}`]: increment(1)
        });
        
        const userDoc = await getDoc(userReactionsRef);
        if (userDoc.exists()) {
          await updateDoc(userReactionsRef, {
            reactions: arrayUnion(emoticonId)
          });
        } else {
          await setDoc(userReactionsRef, {
            userId: user.uid,
            articleId: "memilih-jurusan-article",
            reactions: [emoticonId],
            createdAt: Timestamp.now()
          });
        }
        setUserReactions(prev => [...prev, emoticonId]);
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  // ============================================
  // 8. HANDLE GOOGLE LOGIN
  // ============================================
  const handleGoogleLogin = async () => {
    if (!firebaseAuth) return;
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  // ============================================
  // 9. HANDLE LOGOUT
  // ============================================
  const handleLogout = async () => {
    if (!firebaseAuth) return;
    
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ============================================
  // 10. HANDLE ADD COMMENT
  // ============================================
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb || !newComment.trim()) return;

    setCommentLoading(true);
    
    try {
      const commentsRef = collection(firebaseDb, "blogComments");
      
      await addDoc(commentsRef, {
        articleId: "memilih-jurusan-article",
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userEmail: user.email,
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`,
        comment: newComment,
        likes: 0,
        likedBy: [],
        reactions: {},
        replies: [],
        createdAt: Timestamp.now()
      });

      setNewComment("");
      setShowCommentForm(false);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // ============================================
  // 11. HANDLE ADD REPLY
  // ============================================
  const handleAddReply = async (commentId: string) => {
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb || !replyText.trim()) return;

    try {
      const commentRef = doc(firebaseDb, "blogComments", commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) return;
      
      const replyData = {
        id: `${Date.now()}_${user.uid}`,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`,
        text: replyText,
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: []
      };

      await updateDoc(commentRef, {
        replies: arrayUnion(replyData)
      });

      setReplyText("");
      setSelectedCommentForReply(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  // ============================================
  // 12. HANDLE LIKE COMMENT
  // ============================================
  const handleLikeComment = async (commentId: string, isReply: boolean = false, replyId?: string) => {
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb) return;

    try {
      const commentRef = doc(firebaseDb, "blogComments", commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) return;
      
      const commentData = commentDoc.data();
      
      if (isReply && replyId) {
        // Like reply
        const replies = commentData.replies || [];
        const updatedReplies = replies.map((reply: any) => {
          if (reply.id === replyId) {
            const likedBy = reply.likedBy || [];
            if (likedBy.includes(user.uid)) {
              return {
                ...reply,
                likes: (reply.likes || 0) - 1,
                likedBy: likedBy.filter((id: string) => id !== user.uid)
              };
            } else {
              return {
                ...reply,
                likes: (reply.likes || 0) + 1,
                likedBy: [...likedBy, user.uid]
              };
            }
          }
          return reply;
        });
        
        await updateDoc(commentRef, { replies: updatedReplies });
      } else {
        // Like comment
        const likedBy = commentData.likedBy || [];
        if (likedBy.includes(user.uid)) {
          await updateDoc(commentRef, {
            likes: (commentData.likes || 0) - 1,
            likedBy: arrayRemove(user.uid)
          });
        } else {
          await updateDoc(commentRef, {
            likes: (commentData.likes || 0) + 1,
            likedBy: arrayUnion(user.uid)
          });
        }
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // ============================================
  // 13. SCROLL HANDLER
  // ============================================
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      let currentSection = "pendahuluan";
      
      Object.keys(sectionRefs.current).forEach((key) => {
        const element = sectionRefs.current[key];
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            currentSection = key;
          }
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================
  // 14. SVG COMPONENTS
  // ============================================
  const SouthWestArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M17 7L7 17" stroke="white"/>
      <path d="M17 7H7" stroke="white"/>
      <path d="M17 7V17" stroke="white"/>
    </svg>
  );

  const NorthEastArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M7 7L17 17" stroke="white"/>
      <path d="M7 7H17" stroke="white"/>
      <path d="M7 17V7" stroke="white"/>
    </svg>
  );

  const CalendarIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="white"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="white"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="white"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="white"/>
    </svg>
  );

  const ClockIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
      <circle cx="12" cy="12" r="10" stroke="white"/>
      <polyline points="12 6 12 12 16 14" stroke="white"/>
    </svg>
  );

  const TagIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );

  // ============================================
  // 15. RANGKUMAN SECTIONS
  // ============================================
  const rangkumanSections = [
    { id: "pendahuluan", title: "Pendahuluan" },
    { id: "minat", title: "Minat & Passion" },
    { id: "prospek", title: "Prospek Karir" },
    { id: "riset", title: "Riset & Pertimbangan" },
    { id: "keluarga", title: "Dukungan Keluarga" },
    { id: "keraguan", title: "Keraguan & Ketakutan" },
    { id: "keputusan", title: "Keputusan Final" },
    { id: "adaptasi", title: "Adaptasi di Tahun Pertama" },
    { id: "pelajaran", title: "Pelajaran Berharga" },
    { id: "tips", title: "Tips Memilih Jurusan" },
    { id: "penutup", title: "Penutup" }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ============================================
  // 16. LOADING STATE
  // ============================================
  if (!isMounted || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}>
        <div style={{ color: 'white', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: 'white',
      position: 'relative',
      padding: isMobile ? '20px' : '40px',
    }}>
      
      {/* ===== BANNER DEVELOPMENT ===== */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: '#FF6B00',
          color: 'white',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          borderBottom: '2px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          flexWrap: 'wrap',
        }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          style={{
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          🚧
        </motion.div>
        <span style={{
          fontSize: isMobile ? '0.9rem' : '1.1rem',
          fontWeight: '500',
          textAlign: 'center',
        }}>
          Halaman ini sedang dalam pengembangan, konten blog tidak 100% benar
        </span>
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          style={{
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          🚧
        </motion.div>
      </motion.div>

      {/* HEADER - HALAMAN UTAMA & USER */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '70px' : '80px',
        right: isMobile ? '20px' : '40px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        {/* User Info / Login Button */}
        {user ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '8px 20px',
              borderRadius: '40px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <motion.img 
              whileHover={{ scale: 1.1 }}
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
              alt={user.displayName}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <span style={{
              fontSize: '1rem',
              color: 'white',
              fontWeight: '500',
            }}>
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '30px',
                padding: '6px 16px',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Logout
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '40px',
              padding: '10px 24px',
              color: 'white',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Login dengan Google</span>
          </motion.button>
        )}
        
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          textDecoration: 'none',
          color: 'white',
        }}>
          <span style={{
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: 'normal',
          }}>
            Halaman Utama
          </span>
          <SouthWestArrow 
            width={isMobile ? 30 : 40} 
            height={isMobile ? 30 : 40} 
          />
        </Link>
      </div>

      {/* LAYOUT 2 KOLOM */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '60px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '120px 0 40px' : '150px 0 60px',
      }}>
        
        {/* SIDEBAR KIRI - RANGKUMAN */}
        <div style={{
          flex: isMobile ? '1' : '0 0 280px',
          position: isMobile ? 'relative' : 'sticky',
          top: isMobile ? 'auto' : '130px',
          alignSelf: 'flex-start',
          height: isMobile ? 'auto' : 'calc(100vh - 180px)',
          overflowY: isMobile ? 'visible' : 'auto',
          paddingRight: '20px',
        }}>
          
          {/* Blog Title */}
          <div style={{
            marginBottom: '50px',
          }}>
            <h1 style={{
              fontSize: isMobile ? '4rem' : '6rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
              lineHeight: '0.9',
              letterSpacing: '-2px',
            }}>
              Blog
            </h1>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '20px',
              color: '#999999',
              fontSize: isMobile ? '0.9rem' : '1rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <CalendarIcon width={18} height={18} />
                <span>{formattedDate}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <ClockIcon width={18} height={18} />
                <span>10 menit membaca</span>
              </div>
            </div>
          </div>
          
          <div style={{
            marginBottom: '25px',
          }}>
            <h3 style={{
              fontSize: isMobile ? '1.3rem' : '1.5rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0',
            }}>
              Rangkuman
            </h3>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {rangkumanSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.paddingLeft = '10px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = activeSection === section.id ? 'white' : '#999999';
                  e.currentTarget.style.paddingLeft = '0';
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '5px 0',
                  color: activeSection === section.id ? 'white' : '#999999',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 'normal',
                  transition: 'all 0.2s ease',
                  paddingLeft: '0',
                }}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* KONTEN KANAN - ARTIKEL */}
        <div style={{
          flex: '1',
          maxWidth: isMobile ? '100%' : '700px',
        }}>
          
          <h2 style={{
            fontSize: isMobile ? '2rem' : '2.8rem',
            fontWeight: 'normal',
            color: 'white',
            marginBottom: '40px',
            lineHeight: '1.2',
          }}>
            Mengapa saya memilih jurusan tersebut
          </h2>

          {/* ===== BLOG SEBELUMNYA - PREVIOUS PAGE ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              marginBottom: '60px',
              paddingBottom: '40px',
              borderBottom: '1px solid #333333',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              <span style={{
                fontSize: '0.9rem',
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}>
                Blog Sebelumnya
              </span>
              
              <Link 
                href="/blog/gunadarma" 
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#999999',
                  }}>
                    Previous Page
                  </span>
                  <span style={{
                    fontSize: isMobile ? '1.3rem' : '1.8rem',
                    fontWeight: 'normal',
                    color: 'white',
                  }}>
                    Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma
                  </span>
                  <span style={{
                    fontSize: '0.95rem',
                    color: '#666666',
                    marginTop: '4px',
                  }}>
                    Pengalaman dan cerita selama berkuliah di Gunadarma
                  </span>
                </div>
                
                <motion.div
                  whileHover={{ x: -5, y: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '20px',
                  }}
                >
                  <SouthWestArrow 
                    width={isMobile ? 40 : 50} 
                    height={isMobile ? 40 : 50} 
                  />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* KONTEN ARTIKEL - MEMILIH JURUSAN */}
          <div style={{
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            lineHeight: '1.8',
            color: '#e0e0e0',
          }}>
            <section 
              id="pendahuluan"
              ref={el => sectionRefs.current.pendahuluan = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Pendahuluan
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                "Jurusan apa yang kamu ambil?" Pertanyaan yang selalu muncul saat kita lulus SMA. 
                Sebuah pertanyaan sederhana yang ternyata jawabannya bisa menentukan masa depan. 
                Saya ingat betapa bingungnya saat harus memilih jurusan kuliah. Ratusan pilihan, 
                ribuan pertimbangan, dan jutaan rasa khawatir bercampur menjadi satu.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Setelah melalui proses panjang, akhirnya saya memutuskan untuk mengambil jurusan 
                Teknik Informatika. Bukan karena paksaan orang tua, bukan karena ikut-ikutan teman, 
                dan bukan juga karena sekadar mencari gelar. Ada serangkaian alasan dan pertimbangan 
                yang membuat saya yakin dengan pilihan ini.
              </p>
            </section>
            
            <section 
              id="minat"
              ref={el => sectionRefs.current.minat = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Minat & Passion
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Sejak kecil, saya selalu tertarik dengan komputer. Bukan sekadar untuk bermain game, 
                tapi lebih kepada rasa penasaran tentang bagaimana mesin ini bisa bekerja. Saya ingat 
                pertama kali membongkar CPU komputer ayah yang rusak, mencoba memahami komponen-komponen 
                di dalamnya, meskipun akhirnya tidak bisa dipasang kembali dengan benar.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Di SMA, saya mulai belajar coding secara otodidak. Bahasa pertama yang saya pelajari 
                adalah Python, melalui tutorial online dan buku-buku pinjaman dari perpustakaan. 
                Setiap kali berhasil membuat program sederhana, ada kepuasan tersendiri yang sulit 
                dijelaskan. Rasanya seperti menyusun puzzle raksasa dan akhirnya melihat gambaran utuhnya.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Dari situ saya sadar bahwa ini bukan sekadar hobi. Ketertarikan ini telah menjadi 
                passion yang ingin saya tekuni secara serius. Memilih jurusan yang sesuai dengan minat 
                bukan hanya tentang kebahagiaan saat belajar, tapi juga tentang keberlanjutan karir 
                di masa depan.
              </p>
            </section>
            
            <section 
              id="prospek"
              ref={el => sectionRefs.current.prospek = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Prospek Karir
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Tidak bisa dipungkiri bahwa prospek karir menjadi salah satu pertimbangan utama. 
                Saya tidak ingin menjadi idealis buta yang hanya mengikuti passion tanpa memikirkan 
                masa depan. Teknologi informasi adalah bidang yang terus berkembang. Revolusi industri 
                4.0, transformasi digital, dan kebutuhan akan tenaga IT di berbagai sektor membuat 
                prospek karir di bidang ini sangat menjanjikan.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Saya melakukan riset kecil-kecilan. Saya melihat lowongan pekerjaan di berbagai portal 
                karir, berbicara dengan beberapa alumni yang sudah bekerja, dan membaca artikel tentang 
                tren teknologi ke depan. Data yang saya kumpulkan semakin menguatkan keyakinan bahwa 
                pilihan ini tidak salah.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Bukan berarti saya hanya mengejar uang. Tapi menurut saya, memilih jurusan dengan 
                prospek karir yang baik adalah bentuk tanggung jawab kepada diri sendiri dan keluarga. 
                Passion dan prospek tidak harus selalu bertentangan. Di bidang teknologi, keduanya 
                bisa berjalan beriringan.
              </p>
            </section>
            
            <section 
              id="riset"
              ref={el => sectionRefs.current.riset = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Riset & Pertimbangan
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Memilih jurusan tidak bisa dilakukan dalam semalam. Saya menghabiskan waktu berbulan-bulan 
                untuk melakukan riset. Saya mengunjungi beberapa kampus, mengikuti seminar pendidikan, 
                dan berbicara dengan mahasiswa dari berbagai jurusan. Saya ingin mendapatkan gambaran 
                yang utuh, bukan hanya dari brosur atau website.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Saya juga membandingkan kurikulum dari beberapa universitas untuk jurusan yang sama. 
                Ternyata, setiap kampus memiliki keunggulan dan fokus yang berbeda. Ada yang kuat di 
                bidang jaringan, ada yang fokus pada pengembangan perangkat lunak, ada juga yang 
                mengkombinasikan dengan bisnis dan manajemen.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Selain itu, saya mempertimbangkan faktor-faktor lain seperti akreditasi, biaya, lokasi, 
                fasilitas, dan reputasi alumni. Saya membuat matriks perbandingan, memberikan bobot 
                untuk setiap kriteria, dan mengevaluasi secara objektif. Mungkin terdengar berlebihan, 
                tapi ini tentang masa depan, tidak boleh asal pilih.
              </p>
            </section>
            
            <section 
              id="keluarga"
              ref={el => sectionRefs.current.keluarga = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Dukungan Keluarga
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Awalnya, orang tua saya kurang paham tentang jurusan yang saya pilih. Mereka khawatir 
                apakah setelah lulus nanti pekerjaannya jelas. Wajar, generasi mereka memiliki paradigma 
                yang berbeda. Dulu, pilihan jurusan tidak sebanyak sekarang, dan karir cenderung linear.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Saya tidak marah atau kecewa. Saya justru berusaha menjelaskan dengan sabar. Saya 
                tunjukkan artikel tentang perkembangan industri teknologi, saya ceritakan tentang 
                alumni sukses, dan saya ajak mereka melihat langsung ke kampus. Perlahan tapi pasti, 
                mereka mulai memahami dan akhirnya mendukung penuh keputusan saya.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Dukungan keluarga menjadi fondasi penting. Bukan hanya soal finansial, tapi juga 
                dukungan moral. Ketika nanti menghadapi kesulitan saat kuliah, saya tahu ada orang 
                tua yang selalu mendukung. Itu memberi kekuatan tersendiri.
              </p>
            </section>
            
            <section 
              id="keraguan"
              ref={el => sectionRefs.current.keraguan = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Keraguan & Ketakutan
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Jujur, ada banyak keraguan. Apakah saya cukup pintar untuk bisa bersaing? Apakah 
                passion saja cukup untuk bertahan? Bagaimana jika di tengah jalan saya menyadari 
                bahwa ini bukan jalan yang tepat? Pertanyaan-pertanyaan ini sering muncul di kepala.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Saya juga takut dengan ekspektasi. Ketika memilih jurusan yang cukup populer, 
                ekspektasi dari orang sekitar juga tinggi. Mereka berpikir bahwa lulusan IT pasti 
                langsung bekerja di perusahaan besar dengan gaji tinggi. Padahal realitanya tidak 
                selalu semulus itu.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Tapi saya belajar bahwa keraguan itu wajar. Yang membedakan adalah bagaimana kita 
                merespons keraguan tersebut. Saya memilih untuk menjadikannya sebagai motivasi, 
                bukan penghalang. Saya akan buktikan bahwa dengan kerja keras dan konsistensi, 
                semua kekhawatiran itu bisa diatasi.
              </p>
            </section>
            
            <section 
              id="keputusan"
              ref={el => sectionRefs.current.keputusan = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Keputusan Final
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Setelah melalui proses panjang, akhirnya saya memantapkan pilihan. Bukan berarti 
                saya yakin 100% tanpa keraguan, tapi saya cukup yakin untuk memulai dan berkomitmen. 
                Saya sadar bahwa tidak ada pilihan yang sempurna. Setiap jurusan punya kelebihan 
                dan kekurangan masing-masing.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Yang terpenting bukanlah jurusannya, tapi bagaimana kita menjalaninya. Jurusan 
                yang dianggap "sulit" bisa terasa ringan jika kita benar-benar menyukainya. 
                Sebaliknya, jurusan yang dianggap "mudah" bisa menjadi beban jika kita tidak 
                memiliki minat sama sekali.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Hari ini, saya bersyukur dengan keputusan yang saya ambil. Tidak ada penyesalan, 
                yang ada adalah semangat untuk terus belajar dan berkembang. Mungkin di masa depan 
                saya akan mengambil jalur karir yang berbeda, tapi fondasi yang saya bangun selama 
                kuliah akan selalu berguna.
              </p>
            </section>
            
            <section 
              id="adaptasi"
              ref={el => sectionRefs.current.adaptasi = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Adaptasi di Tahun Pertama
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Tahun pertama adalah masa adaptasi yang berat. Materi kuliah jauh lebih kompleks 
                dari yang saya bayangkan. Ada mata kuliah pemrograman yang membuat saya begadang 
                terus-menerus, matematika diskrit yang membuat kepala pusing, dan algoritma yang 
                menguji logika hingga batas maksimal.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Banyak teman yang mulai goyah. Ada yang mempertimbangkan pindah jurusan, ada juga 
                yang hampir menyerah. Saya sendiri beberapa kali merasa frustrasi. Tapi saya ingat 
                lagi alasan awal memilih jurusan ini. Saya ingat betapa bersemangatnya saat pertama 
                kali belajar coding. Saya ingat bahwa proses ini adalah bagian dari perjalanan.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Perlahan, saya menemukan ritme belajar yang cocok. Saya tidak lagi belajar untuk 
                sekadar lulus ujian, tapi untuk benar-benar memahami. Saya aktif bertanya kepada 
                dosen, berdiskusi dengan teman, dan mencari sumber belajar tambahan di luar kampus. 
                Tantangan di tahun pertama justru menjadi fondasi yang kuat untuk semester-semester 
                berikutnya.
              </p>
            </section>
            
            <section 
              id="pelajaran"
              ref={el => sectionRefs.current.pelajaran = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Pelajaran Berharga
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Dari proses memilih jurusan, saya belajar bahwa tidak ada keputusan yang benar-benar 
                salah selama kita menjalaninya dengan sungguh-sungguh. Saya bertemu dengan kakak 
                tingkat yang lulus dari jurusan yang tidak sesuai minat awalnya, tapi sekarang sukses 
                justru di bidang yang berbeda.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Saya juga belajar bahwa passion bisa ditemukan, bukan hanya dicari. Ketika kita 
                mendalami suatu bidang dengan serius, lama-lama akan muncul ketertarikan dan kecintaan. 
                Yang diperlukan adalah keterbukaan dan kesediaan untuk terus belajar.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Yang paling penting, saya belajar bahwa memilih jurusan bukanlah penentu tunggal 
                masa depan. Jauh lebih penting adalah soft skill, jaringan relasi, dan karakter 
                yang kita bangun selama kuliah. Jurusan hanyalah pintu masuk, setelah itu terserah 
                kita bagaimana menjalani perjalanannya.
              </p>
            </section>
            
            <section 
              id="tips"
              ref={el => sectionRefs.current.tips = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Tips Memilih Jurusan
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Berdasarkan pengalaman saya, berikut beberapa tips untuk adik-adik yang masih 
                bingung memilih jurusan:
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                <strong style={{ color: 'white' }}>1. Kenali dirimu sendiri</strong><br />
                Apa yang kamu sukai? Apa yang kamu kuasai? Jangan hanya mengikuti tren atau paksaan 
                orang lain. Luangkan waktu untuk introspeksi dan memahami minat serta bakatmu.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                <strong style={{ color: 'white' }}>2. Lakukan riset mendalam</strong><br />
                Jangan hanya membaca brosur atau website. Kunjungi kampusnya, bicara dengan 
                mahasiswa aktif, ikuti kelas sampel jika memungkinkan. Informasi yang akurat 
                akan membantu kamu mengambil keputusan yang tepat.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                <strong style={{ color: 'white' }}>3. Pertimbangkan prospek karir</strong><br />
                Idealisme penting, tapi realisme juga tidak kalah penting. Cari tahu peluang kerja, 
                rata-rata gaji, dan perkembangan industri dari jurusan yang kamu pilih.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                <strong style={{ color: 'white' }}>4. Diskusikan dengan keluarga</strong><br />
                Libatkan orang tua dalam proses pengambilan keputusan. Jelaskan alasanmu dengan 
                baik, dengarkan kekhawatiran mereka, dan cari solusi bersama.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                <strong style={{ color: 'white' }}>5. Siapkan rencana cadangan</strong><br />
                Tidak semua rencana berjalan mulus. Siapkan alternatif jika ternyata jurusan 
                pilihan pertama tidak sesuai dengan ekspektasi.
              </p>
            </section>
            
            <section 
              id="penutup"
              ref={el => sectionRefs.current.penutup = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                marginBottom: '20px',
              }}>
                Penutup
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Memilih jurusan adalah salah satu keputusan terbesar dalam hidup. Tapi ingatlah, 
                ini bukan keputusan terakhir. Masih banyak kesempatan untuk belajar hal baru, 
                mengubah jalur karir, atau bahkan memulai dari awal. Yang terpenting adalah 
                keberanian untuk memulai dan konsistensi untuk bertahan.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Saat ini, saya bersyukur telah memilih Teknik Informatika. Bukan karena jurusan 
                ini mudah atau menjanjikan kekayaan instan. Tapi karena melalui jurusan ini, 
                saya belajar cara berpikir sistematis, menyelesaikan masalah kompleks, dan 
                beradaptasi dengan perubahan teknologi yang sangat cepat.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Untuk adik-adik yang sedang galau memilih jurusan, saya ingin bilang: tidak apa-apa 
                bingung, tidak apa-apa takut. Tapi jangan biarkan kebingungan dan ketakutan itu 
                membuatmu diam di tempat. Ambil keputusan terbaik dengan informasi yang kamu miliki 
                saat ini, lalu jalani dengan sepenuh hati.
              </p>
            </section>
          </div>

          {/* ===== TAG SECTION (5 TAG) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              marginTop: '60px',
              marginBottom: '40px',
              paddingTop: '40px',
              borderTop: '1px solid #333333',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}>
              <TagIcon width={20} height={20} />
              <span style={{
                fontSize: '1rem',
                color: '#999999',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Tags
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {articleTags.map((tag) => (
                <Link 
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.span
                    whileHover={{ x: 5 }}
                    style={{
                      display: 'inline-block',
                      padding: '8px 20px',
                      backgroundColor: '#222222',
                      border: '1px solid #444444',
                      borderRadius: '30px',
                      color: '#cccccc',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    #{tag.name}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ===== BLOG SELANJUTNYA - NEXT PAGE ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              marginTop: '40px',
              marginBottom: '60px',
              paddingTop: '40px',
              borderTop: '1px solid #333333',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              <span style={{
                fontSize: '0.9rem',
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}>
                Blog Selanjutnya
              </span>
              
              <Link 
                href="/blog/tips-belajar-coding" 
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#999999',
                  }}>
                    Next Page
                  </span>
                  <span style={{
                    fontSize: isMobile ? '1.3rem' : '1.8rem',
                    fontWeight: 'normal',
                    color: 'white',
                  }}>
                    Tips Belajar Coding untuk Pemula
                  </span>
                  <span style={{
                    fontSize: '0.95rem',
                    color: '#666666',
                    marginTop: '4px',
                  }}>
                    Panduan praktis memulai perjalanan sebagai programmer
                  </span>
                </div>
                
                <motion.div
                  whileHover={{ x: 5, y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '20px',
                  }}
                >
                  <NorthEastArrow 
                    width={isMobile ? 40 : 50} 
                    height={isMobile ? 40 : 50} 
                  />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* ===== EMOTICON REACTIONS ===== */}
          <div style={{
            marginTop: '40px',
            marginBottom: '40px',
            borderTop: '1px solid #333333',
            paddingTop: '40px',
          }}>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '30px',
              }}
            >
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'normal',
                color: 'white',
                margin: 0,
              }}>
                Reaksi
              </h3>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEmoticonPicker(!showEmoticonPicker)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '30px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>😊</span>
                <span>Tambahkan Reaksi</span>
              </motion.button>
            </motion.div>

            {/* Emoticon Picker */}
            <AnimatePresence>
              {showEmoticonPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    overflow: 'hidden',
                    marginBottom: '30px',
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '12px',
                    padding: '24px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {EMOTICONS.map((emoticon) => (
                      <motion.button
                        key={emoticon.id}
                        whileHover={{ scale: 1.2, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          handleReaction(emoticon.id);
                          setShowEmoticonPicker(false);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          background: userReactions.includes(emoticon.id) ? `${emoticon.color}20` : 'rgba(255,255,255,0.05)',
                          border: userReactions.includes(emoticon.id) ? `1px solid ${emoticon.color}` : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          padding: '16px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '2.5rem' }}>{emoticon.emoji}</span>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: userReactions.includes(emoticon.id) ? emoticon.color : '#999999' 
                        }}>
                          {emoticon.label}
                        </span>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          color: 'white',
                          fontWeight: 'bold' 
                        }}>
                          {reactions[emoticon.id] || 0}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Reactions Summary */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
            }}>
              {Object.entries(reactions)
                .filter(([_, count]) => count > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([id, count]) => {
                  const emoticon = EMOTICONS.find(e => e.id === id);
                  if (!emoticon) return null;
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReaction(id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: userReactions.includes(id) ? `${emoticon.color}20` : 'rgba(255,255,255,0.05)',
                        border: userReactions.includes(id) ? `1px solid ${emoticon.color}` : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '30px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{emoticon.emoji}</span>
                      <span style={{ 
                        fontSize: '0.95rem', 
                        color: userReactions.includes(id) ? emoticon.color : 'white' 
                      }}>
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
            </div>
          </div>

          {/* ===== COMMENT SECTION ===== */}

          {/* Add Comment Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              if (!user) {
                handleGoogleLogin();
              } else {
                setShowCommentForm(!showCommentForm);
              }
            }}
            style={{
              width: '100%',
              padding: '20px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed #444444',
              borderRadius: '16px',
              color: user ? '#999999' : 'white',
              fontSize: '1.1rem',
              cursor: 'pointer',
              marginBottom: '40px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {user ? 'Tulis komentar Anda di sini...' : 'Login untuk menulis komentar'}
          </motion.button>

          {/* Comment Form */}
          <AnimatePresence>
            {showCommentForm && user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: '40px' }}
              >
                <form onSubmit={handleAddComment} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                  }}>
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                      alt={user?.displayName}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <div>
                      <span style={{ 
                        color: 'white', 
                        fontSize: '1.2rem',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {user?.displayName || user?.email?.split('@')[0]}
                      </span>
                      <span style={{ color: '#666666', fontSize: '0.9rem' }}>
                        Berkomentar sebagai pengguna
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Apa pendapat Anda tentang artikel ini?"
                    rows={5}
                    required
                    style={{
                      padding: '20px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid #333333',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '1.1rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '15px',
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowCommentForm(false)}
                      style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: '1px solid #333333',
                        borderRadius: '30px',
                        color: '#999999',
                        fontSize: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      Batal
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={commentLoading || !newComment.trim()}
                      style={{
                        padding: '12px 32px',
                        background: commentLoading || !newComment.trim() ? '#333333' : 'white',
                        border: 'none',
                        borderRadius: '30px',
                        color: commentLoading || !newComment.trim() ? '#999999' : 'black',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: commentLoading || !newComment.trim() ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {commentLoading ? 'Mengirim...' : 'Kirim Komentar'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comments List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'normal',
                color: 'white',
                margin: 0,
              }}>
                Komentar
              </h3>
              <span style={{
                fontSize: '1.2rem',
                color: '#666666',
              }}>
                {comments.length} komentar
              </span>
            </div>

            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    padding: '24px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Comment Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                    }}>
                      <motion.img 
                        whileHover={{ scale: 1.1 }}
                        src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userEmail}&background=random`}
                        alt={comment.userName}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(255,255,255,0.1)',
                        }}
                      />
                      <div>
                        <span style={{
                          fontSize: '1.2rem',
                          fontWeight: '500',
                          color: 'white',
                          display: 'block',
                          marginBottom: '4px',
                        }}>
                          {comment.userName}
                        </span>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#666666',
                        }}>
                          {comment.createdAt?.toLocaleDateString?.('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) || 'Baru saja'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Comment Like Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLikeComment(comment.id, false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: comment.likedBy?.includes(user?.uid) ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                        border: comment.likedBy?.includes(user?.uid) ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '30px',
                        padding: '8px 16px',
                        cursor: user ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill={comment.likedBy?.includes(user?.uid) ? "#ef4444" : "none"} 
                        stroke={comment.likedBy?.includes(user?.uid) ? "#ef4444" : "white"} 
                        strokeWidth="1"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span style={{ 
                        color: comment.likedBy?.includes(user?.uid) ? '#ef4444' : 'white',
                        fontSize: '1rem'
                      }}>
                        {comment.likes || 0}
                      </span>
                    </motion.button>
                  </div>

                  {/* Comment Content */}
                  <p style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.7',
                    color: '#e0e0e0',
                    margin: '10px 0 5px 0',
                    paddingLeft: '15px',
                    borderLeft: '2px solid rgba(255,255,255,0.1)',
                  }}>
                    {comment.comment}
                  </p>

                  {/* Reply Button */}
                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (!user) {
                        handleGoogleLogin();
                      } else {
                        setSelectedCommentForReply(
                          selectedCommentForReply === comment.id ? null : comment.id
                        );
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#666666',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      padding: '8px 0',
                      marginTop: '5px',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Balas komentar</span>
                  </motion.button>

                  {/* Reply Form */}
                  <AnimatePresence>
                    {selectedCommentForReply === comment.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          marginTop: '15px',
                          marginLeft: '30px',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '15px',
                        }}>
                          <img 
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                            alt={user?.displayName}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Tulis balasan Anda..."
                              rows={3}
                              style={{
                                padding: '15px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid #333333',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none',
                                resize: 'vertical',
                              }}
                            />
                            <div style={{
                              display: 'flex',
                              gap: '10px',
                              justifyContent: 'flex-end',
                            }}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCommentForReply(null)}
                                style={{
                                  padding: '8px 16px',
                                  background: 'none',
                                  border: '1px solid #333333',
                                  borderRadius: '20px',
                                  color: '#999999',
                                  fontSize: '0.9rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Batal
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAddReply(comment.id)}
                                disabled={!replyText.trim()}
                                style={{
                                  padding: '8px 24px',
                                  background: replyText.trim() ? 'white' : '#333333',
                                  border: 'none',
                                  borderRadius: '20px',
                                  color: replyText.trim() ? 'black' : '#999999',
                                  fontSize: '0.9rem',
                                  fontWeight: '500',
                                  cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                                }}
                              >
                                Kirim Balasan
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div style={{
                      marginTop: '20px',
                      marginLeft: '30px',
                      paddingLeft: '20px',
                      borderLeft: '2px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                    }}>
                      {comment.replies.map((reply: any) => (
                        <motion.div
                          key={reply.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            flex: 1,
                          }}>
                            <img 
                              src={reply.userPhoto || `https://ui-avatars.com/api/?name=${reply.userName}&background=random`}
                              alt={reply.userName}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '5px',
                              }}>
                                <span style={{
                                  fontSize: '1rem',
                                  fontWeight: '500',
                                  color: 'white',
                                }}>
                                  {reply.userName}
                                </span>
                                <span style={{
                                  fontSize: '0.8rem',
                                  color: '#666666',
                                }}>
                                  {reply.createdAt?.toDate?.()?.toLocaleDateString?.('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) || 'Baru saja'}
                                </span>
                              </div>
                              <p style={{
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                color: '#e0e0e0',
                                margin: '0 0 8px 0',
                              }}>
                                {reply.text}
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLikeComment(comment.id, true, reply.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  background: 'none',
                                  border: 'none',
                                  color: reply.likedBy?.includes(user?.uid) ? '#ef4444' : '#666666',
                                  fontSize: '0.85rem',
                                  cursor: user ? 'pointer' : 'not-allowed',
                                  padding: '4px 8px',
                                  borderRadius: '20px',
                                  backgroundColor: reply.likedBy?.includes(user?.uid) ? 'rgba(239,68,68,0.1)' : 'transparent',
                                }}
                              >
                                <svg 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24" 
                                  fill={reply.likedBy?.includes(user?.uid) ? "#ef4444" : "none"} 
                                  stroke="currentColor" 
                                  strokeWidth="1"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                                <span>{reply.likes || 0}</span>
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {comments.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '60px',
                  textAlign: 'center',
                  color: '#666666',
                  border: '1px dashed #333333',
                  borderRadius: '24px',
                }}
              >
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>💬</span>
                <p style={{ fontSize: '1.2rem', margin: 0 }}>Belum ada komentar.</p>
                <p style={{ fontSize: '1rem', color: '#999999', marginTop: '10px' }}>
                  Jadilah yang pertama untuk berdiskusi!
                </p>
              </motion.div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
