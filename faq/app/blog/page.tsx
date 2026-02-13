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

// Admin dan Verified Users
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const VERIFIED_EMAIL = "faridardiansyah051@gmail.com";

export default function BlogPage() {
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

  // State untuk Hover Badge
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // Format tanggal
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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
      const reactionsRef = doc(db, "blogReactions", "gunadarma-article");
      const docSnap = await getDoc(reactionsRef);
      
      if (!docSnap.exists()) {
        const initialCounts: { [key: string]: number } = {};
        EMOTICONS.forEach(emoticon => {
          initialCounts[emoticon.id] = 0;
        });
        
        await setDoc(reactionsRef, {
          articleId: "gunadarma-article",
          counts: initialCounts,
          createdAt: Timestamp.now()
        });
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

    const reactionsRef = doc(firebaseDb, "blogReactions", "gunadarma-article");
    
    const unsubscribe = onSnapshot(reactionsRef, (doc) => {
      if (doc.exists()) {
        setReactions(doc.data().counts || {});
      }
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
        const userReactionsRef = doc(firebaseDb, "userReactions", `${user.uid}_gunadarma-article`);
        const docSnap = await getDoc(userReactionsRef);
        if (docSnap.exists()) {
          setUserReactions(docSnap.data().reactions || []);
        } else {
          await setDoc(userReactionsRef, {
            userId: user.uid,
            articleId: "gunadarma-article",
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
      where("articleId", "==", "gunadarma-article"), 
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
      const reactionsRef = doc(firebaseDb, "blogReactions", "gunadarma-article");
      const userReactionsRef = doc(firebaseDb, "userReactions", `${user.uid}_gunadarma-article`);

      const reactionsDoc = await getDoc(reactionsRef);
      if (!reactionsDoc.exists()) {
        const initialCounts: { [key: string]: number } = {};
        EMOTICONS.forEach(emoticon => {
          initialCounts[emoticon.id] = 0;
        });
        await setDoc(reactionsRef, {
          articleId: "gunadarma-article",
          counts: initialCounts,
          createdAt: Timestamp.now()
        });
      }

      if (userReactions.includes(emoticonId)) {
        await updateDoc(reactionsRef, {
          [`counts.${emoticonId}`]: increment(-1)
        });
        await updateDoc(userReactionsRef, {
          reactions: arrayRemove(emoticonId)
        });
        setUserReactions(prev => prev.filter(id => id !== emoticonId));
      } else {
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
            articleId: "gunadarma-article",
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
        articleId: "gunadarma-article",
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
        userEmail: user.email,
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`,
        text: replyText,
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
        isAdmin: user.email === ADMIN_EMAIL,
        isVerified: user.email === VERIFIED_EMAIL
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

  // ============================================
  // 15. ADMIN BADGE - MINIMALIST, HITAM PUTIH
  // ============================================
  const AdminBadge = ({ email }: { email: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px', verticalAlign: 'middle' }}>
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            background: '#ffffff',
            border: '1px solid #000000',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#000000',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
          whileHover={{ scale: 1.1 }}
        >
          A
        </motion.div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                marginBottom: '8px',
                width: '160px',
                padding: '10px 12px',
                background: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '4px',
                zIndex: 1000,
                color: '#000000',
                fontSize: '12px',
                lineHeight: '1.5',
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>ADMIN</div>
              <div style={{ color: '#555555', fontSize: '11px' }}>Akun administrator blog</div>
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '10px',
                width: '10px',
                height: '10px',
                background: '#ffffff',
                borderLeft: '1px solid #000000',
                borderBottom: '1px solid #000000',
                transform: 'rotate(-45deg)',
                marginTop: '-6px',
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ============================================
  // 16. VERIFIED BADGE - MINIMALIST, HITAM PUTIH
  // ============================================
  const VerifiedBadge = ({ email }: { email: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px', verticalAlign: 'middle' }}>
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            background: '#ffffff',
            border: '1px solid #000000',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#000000',
            fontSize: '12px',
            fontWeight: '600',
          }}
          whileHover={{ scale: 1.1 }}
        >
          ✓
        </motion.div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                marginBottom: '8px',
                width: '160px',
                padding: '10px 12px',
                background: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '4px',
                zIndex: 1000,
                color: '#000000',
                fontSize: '12px',
                lineHeight: '1.5',
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>VERIFIED</div>
              <div style={{ color: '#555555', fontSize: '11px' }}>Akun resmi terverifikasi</div>
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '10px',
                width: '10px',
                height: '10px',
                background: '#ffffff',
                borderLeft: '1px solid #000000',
                borderBottom: '1px solid #000000',
                transform: 'rotate(-45deg)',
                marginTop: '-6px',
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ============================================
  // 17. RANGKUMAN SECTIONS
  // ============================================
  const rangkumanSections = [
    { id: "pendahuluan", title: "Pendahuluan" },
    { id: "sejarah", title: "Sejarah & Reputasi" },
    { id: "suasana", title: "Suasana Kampus" },
    { id: "akademik", title: "Kehidupan Akademik" },
    { id: "dosen", title: "Para Dosen" },
    { id: "teman", title: "Pertemanan & Relasi" },
    { id: "fasilitas", title: "Fasilitas Kampus" },
    { id: "organisasi", title: "Organisasi & Kegiatan" },
    { id: "tantangan", title: "Tantangan & Hambatan" },
    { id: "kesan", title: "Kesan & Pesan" },
    { id: "penutup", title: "Penutup" }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ============================================
  // 18. LOADING STATE
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
      
      {/* HEADER - HALAMAN UTAMA & USER */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '20px' : '40px',
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
              background: '#0a0a0a',
              padding: '8px 20px',
              borderRadius: '30px',
              border: '1px solid #333333',
            }}
          >
            <motion.img 
              whileHover={{ scale: 1.1 }}
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=333333&color=ffffff`} 
              alt={user.displayName}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #666666',
              }}
            />
            <span style={{
              fontSize: '1rem',
              color: 'white',
              fontWeight: '400',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              {user.displayName || user.email?.split('@')[0]}
              {user.email === ADMIN_EMAIL && <AdminBadge email={user.email} />}
              {user.email === VERIFIED_EMAIL && <VerifiedBadge email={user.email} />}
            </span>
            <motion.button
              whileHover={{ scale: 1.05, background: '#222222' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              style={{
                background: '#1a1a1a',
                border: '1px solid #444444',
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
            whileHover={{ scale: 1.05, background: '#1a1a1a' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#0a0a0a',
              border: '1px solid #333333',
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
            <span>Login</span>
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
            fontWeight: '400',
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
        padding: isMobile ? '100px 0 40px' : '120px 0 60px',
      }}>
        
        {/* SIDEBAR KIRI - RANGKUMAN */}
        <div style={{
          flex: isMobile ? '1' : '0 0 280px',
          position: isMobile ? 'relative' : 'sticky',
          top: isMobile ? 'auto' : '100px',
          alignSelf: 'flex-start',
          height: isMobile ? 'auto' : 'calc(100vh - 150px)',
          overflowY: isMobile ? 'visible' : 'auto',
          paddingRight: '20px',
        }}>
          
          {/* Blog Title */}
          <div style={{
            marginBottom: '50px',
          }}>
            <h1 style={{
              fontSize: isMobile ? '4rem' : '6rem',
              fontWeight: '400',
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
                <span>8 menit membaca</span>
              </div>
            </div>
          </div>
          
          <div style={{
            marginBottom: '25px',
          }}>
            <h3 style={{
              fontSize: isMobile ? '1.3rem' : '1.5rem',
              fontWeight: '400',
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
                  fontWeight: '400',
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
            fontWeight: '400',
            color: 'white',
            marginBottom: '40px',
            lineHeight: '1.2',
          }}>
            Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma
          </h2>

          {/* KONTEN ARTIKEL - LENGKAP */}
          <div style={{
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            lineHeight: '1.8',
            color: '#e0e0e0',
          }}>
            {/* Pendahuluan */}
            <section 
              id="pendahuluan"
              ref={el => sectionRefs.current.pendahuluan = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Pendahuluan
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Masuk ke Universitas Gunadarma adalah salah satu keputusan terbesar dalam hidup saya. 
                Banyak orang bertanya, "Bagaimana rasanya?" Pertanyaan sederhana namun jawabannya sangat kompleks. 
                Ini bukan sekadar tentang perkuliahan, tapi tentang perjalanan menemukan jati diri, 
                bertemu dengan berbagai karakter manusia, dan belajar bahwa kehidupan tidak selalu hitam dan putih.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Gunadarma mengajarkan saya bahwa pendidikan bukan hanya tentang nilai di atas kertas, 
                tapi tentang bagaimana kita berpikir kritis, menyelesaikan masalah, dan beradaptasi dengan perubahan. 
                Di sini, saya belajar bahwa kegagalan adalah bagian dari proses, dan kesuksesan adalah akumulasi dari ribuan percobaan.
              </p>
            </section>
            
            {/* Sejarah & Reputasi */}
            <section 
              id="sejarah"
              ref={el => sectionRefs.current.sejarah = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Sejarah & Reputasi
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Universitas Gunadarma berdiri pada tahun 1981, berawal dari sebuah kursus komputer kecil 
                yang kemudian berkembang menjadi salah satu perguruan tinggi swasta terkemuka di Indonesia. 
                Reputasi Gunadarma di bidang teknologi informasi dan komputer sudah tidak diragukan lagi.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Banyak alumni Gunadarma yang kini bekerja di perusahaan-perusahaan besar, 
                baik di dalam maupun luar negeri. Ini membuktikan bahwa kualitas pendidikan di sini 
                diakui secara nasional dan internasional.
              </p>
            </section>
            
            {/* Suasana Kampus */}
            <section 
              id="suasana"
              ref={el => sectionRefs.current.suasana = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Suasana Kampus
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Suasana kampus Gunadarma selalu hidup. Dari pagi hingga malam, mahasiswa lalu-lalang 
                dengan berbagai aktivitas. Ada yang buru-buru masuk kelas, ada yang nongkrong di kantin, 
                ada juga yang asyik mengerjakan tugas di perpustakaan. Kampus ini tidak pernah tidur.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Yang paling berkesan adalah ketika jam istirahat tiba. Kantin penuh sesak, 
                antrian panjang di depan gerobak bakso, dan tawa riang mahasiswa yang melepas penat. 
                Momen-momen sederhana inilah yang akan selalu saya ingat.
              </p>
            </section>
            
            {/* Kehidupan Akademik */}
            <section 
              id="akademik"
              ref={el => sectionRefs.current.akademik = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Kehidupan Akademik
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Sistem akademik di Gunadarma terkenal dengan disiplinnya. Absensi sidik jari, 
                tugas yang menumpuk, praktikum yang melelahkan, namun semua itu membentuk karakter 
                kami menjadi pribadi yang tangguh dan bertanggung jawab.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Tugas besar atau yang sering disebut "tubesar" adalah momok yang menakutkan sekaligus 
                momen yang mendewasakan. Begadang berhari-hari, debugging kode sampai mata merah, 
                dan akhirnya presentasi di depan dosen yang kritis. Rasanya campur aduk, tapi kepuasan 
                saat aplikasi buatan sendiri berjalan dengan sempurna tidak ternilai harganya.
              </p>
            </section>
            
            {/* Para Dosen */}
            <section 
              id="dosen"
              ref={el => sectionRefs.current.dosen = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Para Dosen
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Dosen-dosen di Gunadarma memiliki latar belakang yang beragam. Ada yang galak dan disiplin, 
                ada juga yang santai dan humoris. Tapi satu hal yang pasti, mereka semua berdedikasi 
                untuk mentransfer ilmu kepada mahasiswanya.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Saya ingat dosen pemrograman yang selalu berkata, "Coding itu seperti seni, 
                butuh feeling dan latihan." Atau dosen basis data yang dengan sabar menjelaskan 
                normalisasi sampai kami benar-benar paham. Mereka tidak hanya mengajar, tapi juga 
                menginspirasi.
              </p>
            </section>
            
            {/* Pertemanan & Relasi */}
            <section 
              id="teman"
              ref={el => sectionRefs.current.teman = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Pertemanan & Relasi
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Harta paling berharga selama kuliah adalah teman-teman. Mereka yang menemani begadang 
                saat deadline, yang meminjamkan catatan ketika kita absen, yang menghibur ketika nilai 
                jelek, dan yang merayakan setiap pencapaian kecil.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Dari sekadar teman sekelas, menjadi sahabat, bahkan keluarga. Kami saling mengenal 
                karakter masing-masing, tahu siapa yang jago coding, siapa yang jago desain, siapa 
                yang jago presentasi. Kerja sama tim yang solid terbentuk secara alami.
              </p>
            </section>
            
            {/* Fasilitas Kampus */}
            <section 
              id="fasilitas"
              ref={el => sectionRefs.current.fasilitas = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Fasilitas Kampus
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Gunadarma memiliki fasilitas yang lengkap. Laboratorium komputer dengan spesifikasi tinggi, 
                perpustakaan dengan koleksi buku yang up-to-date, ruang kelas ber-AC, akses WiFi cepat, 
                dan area parkir yang luas. Semua mendukung proses belajar mengajar.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Yang paling saya sukai adalah perpustakaannya. Selain koleksi bukunya yang lengkap, 
                suasananya nyaman untuk belajar. Banyak mahasiswa menghabiskan waktu berjam-jam di sini, 
                membaca buku, mengerjakan tugas, atau sekadar mencari inspirasi.
              </p>
            </section>
            
            {/* Organisasi & Kegiatan */}
            <section 
              id="organisasi"
              ref={el => sectionRefs.current.organisasi = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Organisasi & Kegiatan
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Selain akademik, Gunadarma juga aktif dalam berbagai organisasi dan kegiatan 
                ekstrakurikuler. Ada BEM, himpunan mahasiswa, UKM olahraga, seni, robotik, 
                dan masih banyak lagi. Mahasiswa diberi kebebasan untuk mengembangkan minat dan bakat.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Saya sendiri aktif di UKM Robotik. Di sana saya belajar banyak hal yang tidak diajarkan 
                di kelas: kerja tim di bawah tekanan, manajemen proyek, dan problem-solving. Pengalaman 
                mengikuti kontes robotika nasional adalah salah satu pencapaian terbesar saya selama kuliah.
              </p>
            </section>
            
            {/* Tantangan & Hambatan */}
            <section 
              id="tantangan"
              ref={el => sectionRefs.current.tantangan = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Tantangan & Hambatan
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Tidak selalu mulus. Ada kalanya saya merasa lelah, stres, bahkan ingin menyerah. 
                Tugas yang menumpuk, praktikum yang gagal, nilai yang tidak memuaskan, semua itu 
                adalah bagian dari proses pendewasaan.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Tantangan terbesar adalah membagi waktu antara kuliah, organisasi, dan kehidupan pribadi. 
                Seringkali saya harus begadang demi menyelesaikan semua tanggungan. Tapi justru dari 
                situ saya belajar tentang prioritas dan manajemen waktu.
              </p>
            </section>
            
            {/* Kesan & Pesan */}
            <section 
              id="kesan"
              ref={el => sectionRefs.current.kesan = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Kesan & Pesan
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Universitas Gunadarma bukan sekadar tempat saya mengejar gelar sarjana. 
                Ini adalah rumah kedua yang membentuk saya menjadi pribadi yang lebih baik. 
                Di sini saya belajar bahwa kesuksesan bukan tentang seberapa cepat kita lulus, 
                tapi seberapa banyak ilmu dan pengalaman yang kita dapatkan.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Pesan saya untuk adik-adik yang akan berkuliah di Gunadarma: nikmati setiap prosesnya. 
                Jangan terlalu fokus pada nilai, tapi kejarlah ilmu dan pengalaman. Aktiflah di organisasi, 
                perbanyak relasi, dan jangan takut gagal.
              </p>
            </section>
            
            {/* Penutup */}
            <section 
              id="penutup"
              ref={el => sectionRefs.current.penutup = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '400',
                color: 'white',
                marginBottom: '20px',
              }}>
                Penutup
              </h3>
              <p style={{ marginBottom: '1.5em' }}>
                Kuliah di Gunadarma adalah perjalanan yang penuh warna. Setiap suka dan duka, 
                setiap tawa dan tangis, setiap keberhasilan dan kegagalan, semuanya membentuk 
                saya menjadi pribadi yang lebih kuat dan siap menghadapi dunia.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Terima kasih Gunadarma, terima kasih para dosen, dan terima kasih teman-teman. 
                Kalian adalah bagian terindah dalam perjalanan hidup saya.
              </p>
            </section>
          </div>

          {/* ===== EMOTICON REACTIONS ===== */}
          <div style={{
            marginTop: '60px',
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
                fontWeight: '400',
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
                  border: '1px solid #333333',
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
                    background: '#0a0a0a',
                    border: '1px solid #333333',
                    borderRadius: '16px',
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
                          background: userReactions.includes(emoticon.id) ? '#222222' : 'transparent',
                          border: userReactions.includes(emoticon.id) ? '1px solid #ffffff' : '1px solid #333333',
                          borderRadius: '12px',
                          padding: '12px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '2rem' }}>{emoticon.emoji}</span>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          color: userReactions.includes(emoticon.id) ? 'white' : '#999999' 
                        }}>
                          {emoticon.label}
                        </span>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: 'white',
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
                        background: userReactions.includes(id) ? '#222222' : '#0a0a0a',
                        border: userReactions.includes(id) ? '1px solid #ffffff' : '1px solid #333333',
                        borderRadius: '30px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{emoticon.emoji}</span>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        color: 'white' 
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
              borderRadius: '12px',
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
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=333333&color=ffffff`}
                      alt={user?.displayName}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid #666666',
                      }}
                    />
                    <div>
                      <span style={{ 
                        color: 'white', 
                        fontSize: '1.1rem',
                        fontWeight: '400',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        {user?.displayName || user?.email?.split('@')[0]}
                        {user.email === ADMIN_EMAIL && <AdminBadge email={user.email} />}
                        {user.email === VERIFIED_EMAIL && <VerifiedBadge email={user.email} />}
                      </span>
                      <span style={{ color: '#999999', fontSize: '0.85rem' }}>
                        Berkomentar
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Apa pendapat Anda tentang artikel ini?"
                    rows={4}
                    required
                    style={{
                      padding: '16px',
                      background: '#0a0a0a',
                      border: '1px solid #333333',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowCommentForm(false)}
                      style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: '1px solid #444444',
                        borderRadius: '30px',
                        color: '#999999',
                        fontSize: '0.95rem',
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
                        padding: '10px 28px',
                        background: commentLoading || !newComment.trim() ? '#333333' : 'white',
                        border: 'none',
                        borderRadius: '30px',
                        color: commentLoading || !newComment.trim() ? '#999999' : 'black',
                        fontSize: '0.95rem',
                        fontWeight: '400',
                        cursor: commentLoading || !newComment.trim() ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {commentLoading ? 'Mengirim...' : 'Kirim'}
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
                fontWeight: '400',
                color: 'white',
                margin: 0,
              }}>
                Komentar
              </h3>
              <span style={{
                fontSize: '1.1rem',
                color: '#999999',
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
                    gap: '12px',
                    padding: '20px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '12px',
                    border: comment.userEmail === ADMIN_EMAIL || comment.userEmail === VERIFIED_EMAIL ? '1px solid #ffffff' : '1px solid #333333',
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
                      gap: '12px',
                    }}>
                      <motion.img 
                        whileHover={{ scale: 1.1 }}
                        src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userEmail}&background=333333&color=ffffff`}
                        alt={comment.userName}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid #666666',
                        }}
                      />
                      <div>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: '400',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}>
                          {comment.userName}
                          {comment.userEmail === ADMIN_EMAIL && <AdminBadge email={comment.userEmail} />}
                          {comment.userEmail === VERIFIED_EMAIL && <VerifiedBadge email={comment.userEmail} />}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          color: '#999999',
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
                        gap: '6px',
                        background: comment.likedBy?.includes(user?.uid) ? '#222222' : '#0a0a0a',
                        border: '1px solid #444444',
                        borderRadius: '20px',
                        padding: '6px 12px',
                        cursor: user ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill={comment.likedBy?.includes(user?.uid) ? "#ffffff" : "none"} 
                        stroke="#ffffff" 
                        strokeWidth="1"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span style={{ 
                        color: 'white',
                        fontSize: '0.9rem'
                      }}>
                        {comment.likes || 0}
                      </span>
                    </motion.button>
                  </div>

                  {/* Comment Content */}
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    color: '#e0e0e0',
                    margin: '5px 0',
                    paddingLeft: '12px',
                    borderLeft: comment.userEmail === ADMIN_EMAIL || comment.userEmail === VERIFIED_EMAIL ? '2px solid #ffffff' : '2px solid #444444',
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
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: '#999999',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      padding: '6px 0',
                      marginTop: '5px',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Balas</span>
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
                          marginTop: '10px',
                          marginLeft: '20px',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                        }}>
                          <img 
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=333333&color=ffffff`}
                            alt={user?.displayName}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid #666666',
                            }}
                          />
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Tulis balasan Anda..."
                              rows={2}
                              style={{
                                padding: '12px',
                                background: '#0a0a0a',
                                border: '1px solid #333333',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '0.9rem',
                                outline: 'none',
                                resize: 'vertical',
                              }}
                            />
                            <div style={{
                              display: 'flex',
                              gap: '8px',
                              justifyContent: 'flex-end',
                            }}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCommentForReply(null)}
                                style={{
                                  padding: '6px 14px',
                                  background: 'none',
                                  border: '1px solid #444444',
                                  borderRadius: '20px',
                                  color: '#999999',
                                  fontSize: '0.85rem',
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
                                  padding: '6px 20px',
                                  background: replyText.trim() ? 'white' : '#333333',
                                  border: 'none',
                                  borderRadius: '20px',
                                  color: replyText.trim() ? 'black' : '#999999',
                                  fontSize: '0.85rem',
                                  fontWeight: '400',
                                  cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                                }}
                              >
                                Kirim
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
                      marginTop: '15px',
                      marginLeft: '20px',
                      paddingLeft: '15px',
                      borderLeft: '1px solid #444444',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '15px',
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
                            gap: '10px',
                            flex: 1,
                          }}>
                            <img 
                              src={reply.userPhoto || `https://ui-avatars.com/api/?name=${reply.userName}&background=333333&color=ffffff`}
                              alt={reply.userName}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid #666666',
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                              }}>
                                <span style={{
                                  fontSize: '0.95rem',
                                  fontWeight: '400',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}>
                                  {reply.userName}
                                  {reply.userEmail === ADMIN_EMAIL && <AdminBadge email={reply.userEmail} />}
                                  {reply.userEmail === VERIFIED_EMAIL && <VerifiedBadge email={reply.userEmail} />}
                                  {reply.isAdmin && <AdminBadge email={reply.userEmail || ADMIN_EMAIL} />}
                                  {reply.isVerified && <VerifiedBadge email={reply.userEmail || VERIFIED_EMAIL} />}
                                </span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: '#999999',
                                }}>
                                  {reply.createdAt?.toDate?.()?.toLocaleDateString?.('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) || 'Baru saja'}
                                </span>
                              </div>
                              <p style={{
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                                color: '#e0e0e0',
                                margin: '0 0 6px 0',
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
                                  gap: '4px',
                                  background: 'none',
                                  border: 'none',
                                  color: reply.likedBy?.includes(user?.uid) ? '#ffffff' : '#999999',
                                  fontSize: '0.8rem',
                                  cursor: user ? 'pointer' : 'not-allowed',
                                  padding: '2px 6px',
                                  borderRadius: '12px',
                                  backgroundColor: reply.likedBy?.includes(user?.uid) ? '#222222' : 'transparent',
                                }}
                              >
                                <svg 
                                  width="12" 
                                  height="12" 
                                  viewBox="0 0 24 24" 
                                  fill={reply.likedBy?.includes(user?.uid) ? "#ffffff" : "none"} 
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
                  padding: '50px',
                  textAlign: 'center',
                  color: '#999999',
                  border: '1px dashed #444444',
                  borderRadius: '12px',
                }}
              >
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '15px' }}>💬</span>
                <p style={{ fontSize: '1.1rem', margin: 0 }}>Belum ada komentar.</p>
                <p style={{ fontSize: '0.95rem', color: '#666666', marginTop: '8px' }}>
                  Jadilah yang pertama!
                </p>
              </motion.div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
