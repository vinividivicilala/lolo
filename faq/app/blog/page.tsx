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
  { id: 'like', emoji: '👍', label: 'Suka' },
  { id: 'heart', emoji: '❤️', label: 'Cinta' },
  { id: 'laugh', emoji: '😂', label: 'Lucu' },
  { id: 'wow', emoji: '😮', label: 'Kagum' },
  { id: 'sad', emoji: '😢', label: 'Sedih' },
  { id: 'angry', emoji: '😠', label: 'Marah' }
];

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

  // State untuk Share
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [showAuthorTooltip, setShowAuthorTooltip] = useState(false);

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
      
      // Initialize blog reactions document
      initializeBlogReactions(db);
      // Initialize share count
      initializeShareCount(db);
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
  // 3. INITIALIZE SHARE COUNT
  // ============================================
  const initializeShareCount = async (db: any) => {
    try {
      const shareRef = doc(db, "blogShares", "gunadarma-article");
      const docSnap = await getDoc(shareRef);
      
      if (!docSnap.exists()) {
        await setDoc(shareRef, {
          articleId: "gunadarma-article",
          count: 0,
          createdAt: Timestamp.now()
        });
        setShareCount(0);
      } else {
        setShareCount(docSnap.data().count || 0);
      }
    } catch (error) {
      console.error("Error initializing share count:", error);
    }
  };

  // ============================================
  // 4. LOAD SHARE COUNT (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const shareRef = doc(firebaseDb, "blogShares", "gunadarma-article");
    
    const unsubscribe = onSnapshot(shareRef, (doc) => {
      if (doc.exists()) {
        setShareCount(doc.data().count || 0);
      }
    }, (error) => {
      console.error("Error loading share count:", error);
    });

    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized]);

  // ============================================
  // 5. AUTH STATE LISTENER
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
  // 6. LOAD REACTIONS FROM FIREBASE (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const reactionsRef = doc(firebaseDb, "blogReactions", "gunadarma-article");
    
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
  // 7. LOAD USER REACTIONS
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
  // 8. LOAD COMMENTS FROM FIREBASE (REAL-TIME)
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
    }, (error) => {
      console.error("Error loading comments:", error);
    });

    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized]);

  // ============================================
  // 9. HANDLE REACTION (EMOTICON)
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
  // 10. HANDLE GOOGLE LOGIN
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
  // 11. HANDLE LOGOUT
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
  // 12. HANDLE ADD COMMENT
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
  // 13. HANDLE ADD REPLY
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
  // 14. HANDLE LIKE COMMENT
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
  // 15. HANDLE SHARE
  // ============================================
  const handleShare = () => {
    setShowShareModal(true);
  };

  const incrementShareCount = async () => {
    if (!firebaseDb) return;
    
    try {
      const shareRef = doc(firebaseDb, "blogShares", "gunadarma-article");
      await updateDoc(shareRef, {
        count: increment(1)
      });
    } catch (error) {
      console.error("Error incrementing share count:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      await incrementShareCount();
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareModal(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareToSocialMedia = async (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma');
    let shareUrl = '';

    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
        break;
      case 'quora':
        shareUrl = `https://www.quora.com/share?url=${url}&title=${title}`;
        break;
      default:
        return;
    }

    await incrementShareCount();
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareModal(false);
  };

  // ============================================
  // 16. SCROLL HANDLER
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
  // 17. SVG COMPONENTS
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
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );

  const ShareIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="18" cy="5" r="3" stroke="currentColor"/>
      <circle cx="6" cy="12" r="3" stroke="currentColor"/>
      <circle cx="18" cy="19" r="3" stroke="currentColor"/>
      <line x1="15.59" y1="6.59" x2="8.42" y2="10.41" stroke="currentColor"/>
      <line x1="15.59" y1="17.41" x2="8.42" y2="13.59" stroke="currentColor"/>
    </svg>
  );

  // Social Media Icons
  const TwitterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const LinkedInIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  const WhatsAppIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.12 1.522 5.851L.51 23.49l5.639-1.012A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.86 0-3.633-.5-5.155-1.373l-.37-.221-3.344.6.6-3.344-.221-.37A9.937 9.937 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
    </svg>
  );

  const TelegramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.772-2.898 6.534-3.566 8.356-.366 1-.792 1.001-1.147 1.001-.317 0-.453-.146-.689-.343-.25-.21-1.583-1.521-1.583-1.521l-1.732-1.172 1.088-1.029c.12-.111 2.264-2.063 4.379-3.98.089-.083.173-.158.25-.231.262-.249.088-.403-.173-.275-.413.203-5.023 3.235-5.61 3.61-.069.044-.14.086-.211.127-1.112.644-1.939.944-2.493 1.018-.552.074-.899-.117-1.094-.305-.176-.169-.535-.523-.825-.875-.376-.455-.669-.939.041-1.466.292-.216 3.572-2.346 7.119-4.654.853-.554 1.654-1.044 2.318-1.382.705-.359 1.265-.502 1.672-.502.373 0 .806.115.976.434.188.352.13.803.005 1.184z"/>
    </svg>
  );

  const QuoraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.555 17.025c-.668-1.216-1.27-2.548-1.778-3.942-.508-1.394-.916-2.829-1.222-4.306-.306-1.477-.457-2.978-.457-4.503h2.591c0 1.397.114 2.766.343 4.108.229 1.342.582 2.647 1.058 3.914.476 1.267 1.079 2.486 1.807 3.658.728-1.172 1.331-2.391 1.807-3.658.476-1.267.829-2.572 1.058-3.914.229-1.342.343-2.711.343-4.108h2.591c0 1.525-.152 3.026-.457 4.503-.305 1.477-.713 2.912-1.222 4.306-.508 1.394-1.11 2.726-1.778 3.942 1.016 1.588 2.287 2.919 3.815 3.994-1.092.051-2.147.255-3.162.611-1.016.356-1.968.855-2.857 1.498-.89-.643-1.842-1.142-2.857-1.498-1.016-.356-2.07-.56-3.162-.611 1.528-1.075 2.799-2.406 3.815-3.994z"/>
    </svg>
  );

  // ============================================
  // 18. RANGKUMAN SECTIONS
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

  // Author Bio
  const authorBio = {
    name: "Farid Ardiansyah",
    role: "Penulis & Content Creator",
    bio: "Mahasiswa aktif Universitas Gunadarma yang gemar menulis tentang pengalaman kuliah, teknologi, dan pengembangan diri. Aktif di berbagai organisasi kampus dan UKM Robotik.",
    email: "farid.ardiansyah@gunadarma.ac.id",
    social: {
      twitter: "https://twitter.com/faridard",
      linkedin: "https://linkedin.com/in/faridardiansyah",
      instagram: "https://instagram.com/faridard"
    }
  };

  // ============================================
  // 19. LOADING STATE
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
        {/* Share Button with Count */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '40px',
            padding: '10px 24px',
            color: 'white',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <ShareIcon width={20} height={20} />
          <span>Bagikan</span>
          <span style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '2px 8px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: '#FF6B00',
          }}>
            {shareCount}
          </span>
        </motion.button>

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

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: '#1a1a1a',
                borderRadius: '32px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid #333333',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
              }}>
                <div>
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 'normal',
                    color: 'white',
                    margin: '0 0 8px 0',
                  }}>
                    Bagikan Artikel
                  </h3>
                  <span style={{
                    fontSize: '0.95rem',
                    color: '#999999',
                  }}>
                    {shareCount} orang telah membagikan artikel ini
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowShareModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999999',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ×
                </motion.button>
              </div>

              {/* Copy Link */}
              <div style={{
                marginBottom: '30px',
              }}>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '10px',
                }}>
                  <input
                    type="text"
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '15px 20px',
                      background: '#2a2a2a',
                      border: '1px solid #444444',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    style={{
                      padding: '15px 25px',
                      background: copySuccess ? '#00CC88' : 'white',
                      border: 'none',
                      borderRadius: '16px',
                      color: copySuccess ? 'white' : 'black',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {copySuccess ? 'Tersalin!' : 'Salin Link'}
                  </motion.button>
                </div>
              </div>

              {/* Social Media Share */}
              <div>
                <p style={{
                  color: '#999999',
                  marginBottom: '20px',
                  fontSize: '0.95rem',
                }}>
                  Bagikan ke media sosial:
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                }}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => shareToSocialMedia('twitter')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '15px',
                      background: '#2a2a2a',
                      border: '1px solid #444444',
                      borderRadius: '16px',
                      color: '#1DA1F2',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <TwitterIcon />
                    <span style={{ fontSize: '0.8rem', color: '#cccccc' }}>Twitter</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => shareToSocialMedia('facebook')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '15px',
                      background: '#2a2a2a',
                      border: '1px solid #444444',
                      borderRadius: '16px',
                      color: '#4267B2',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <FacebookIcon />
                    <span style={{ fontSize: '0.8rem', color: '#cccccc' }}>Facebook</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => shareToSocialMedia('linkedin')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '15px',
                      background: '#2a2a2a',
                      border: '1px solid #444444',
                      borderRadius: '16px',
                      color: '#0077B5',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <LinkedInIcon />
                    <span style={{ fontSize: '0.8rem', color: '#cccccc' }}>LinkedIn</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => shareToSocialMedia('whatsapp')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '15px',
                      background: '#2a2a2a',
                      border: '1px solid #444444',
                      borderRadius: '16px',
                      color: '#25D366',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <WhatsAppIcon />
                    <span style={{ fontSize: '0.8rem', color: '#cccccc' }}>WhatsApp</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => shareToSocialMedia('telegram')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '15px',
                      background: '#2a2a2a',
                      border: '1px solid #444444',
                      borderRadius: '16px',
                      color: '#0088cc',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <TelegramIcon />
                    <span style={{ fontSize: '0.8rem', color: '#cccccc' }}>Telegram</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => shareToSocialMedia('quora')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '15px',
                      background: '#2a2a2a',
                      border: '1px solid #444444',
                      borderRadius: '16px',
                      color: '#B92B27',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <QuoraIcon />
                    <span style={{ fontSize: '0.8rem', color: '#cccccc' }}>Quora</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <span>8 menit membaca</span>
              </div>
              {/* Author Info with Tooltip */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid #333333',
                  position: 'relative',
                }}
                onMouseEnter={() => setShowAuthorTooltip(true)}
                onMouseLeave={() => setShowAuthorTooltip(false)}
              >
                <img 
                  src="https://ui-avatars.com/api/?name=Farid+Ardiansyah&background=FF6B00&color=fff&size=32" 
                  alt="Farid Ardiansyah"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                />
                <div>
                  <span style={{
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'block',
                    cursor: 'pointer',
                  }}>
                    Farid Ardiansyah
                  </span>
                  <span style={{
                    color: '#999999',
                    fontSize: '0.85rem',
                  }}>
                    Penulis
                  </span>
                </div>

                {/* Author Tooltip */}
                <AnimatePresence>
                  {showAuthorTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '15px',
                        background: '#1a1a1a',
                        border: '1px solid #333333',
                        borderRadius: '16px',
                        padding: '20px',
                        width: '280px',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginBottom: '15px',
                      }}>
                        <img 
                          src="https://ui-avatars.com/api/?name=Farid+Ardiansyah&background=FF6B00&color=fff&size=48" 
                          alt="Farid Ardiansyah"
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <span style={{
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '4px',
                          }}>
                            Farid Ardiansyah
                          </span>
                          <span style={{
                            color: '#FF6B00',
                            fontSize: '0.9rem',
                          }}>
                            {authorBio.role}
                          </span>
                        </div>
                      </div>
                      <p style={{
                        color: '#cccccc',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        marginBottom: '15px',
                      }}>
                        {authorBio.bio}
                      </p>
                      <div style={{
                        display: 'flex',
                        gap: '15px',
                      }}>
                        <a href={authorBio.social.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                        <a href={authorBio.social.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0077B5' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                        <a href={authorBio.social.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma
          </h2>

          {/* KONTEN ARTIKEL - LENGKAP */}
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
            
            <section 
              id="sejarah"
              ref={el => sectionRefs.current.sejarah = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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
            
            <section 
              id="suasana"
              ref={el => sectionRefs.current.suasana = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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
            
            <section 
              id="akademik"
              ref={el => sectionRefs.current.akademik = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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
            
            <section 
              id="dosen"
              ref={el => sectionRefs.current.dosen = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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
            
            <section 
              id="teman"
              ref={el => sectionRefs.current.teman = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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
            
            <section 
              id="fasilitas"
              ref={el => sectionRefs.current.fasilitas = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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
            
            <section 
              id="organisasi"
              ref={el => sectionRefs.current.organisasi = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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
            
            <section 
              id="tantangan"
              ref={el => sectionRefs.current.tantangan = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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
            
            <section 
              id="kesan"
              ref={el => sectionRefs.current.kesan = el}
              style={{ scrollMarginTop: '130px', marginBottom: '3em' }}
            >
              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: 'normal',
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

          {/* ===== TAG SECTION (2 TAG SAJA) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              marginTop: '40px',
              marginBottom: '40px',
              paddingTop: '20px',
              borderTop: '1px solid #333333',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
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
              gap: '15px',
            }}>
              <Link 
                href="/tag/kuliah"
                style={{ textDecoration: 'none' }}
              >
                <motion.span
                  whileHover={{ x: 5 }}
                  style={{
                    display: 'inline-block',
                    padding: '6px 18px',
                    backgroundColor: '#222222',
                    border: '1px solid #444444',
                    borderRadius: '30px',
                    color: '#cccccc',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  #kuliah
                </motion.span>
              </Link>
              
              <Link 
                href="/tag/gunadarma"
                style={{ textDecoration: 'none' }}
              >
                <motion.span
                  whileHover={{ x: 5 }}
                  style={{
                    display: 'inline-block',
                    padding: '6px 18px',
                    backgroundColor: '#222222',
                    border: '1px solid #444444',
                    borderRadius: '30px',
                    color: '#cccccc',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  #gunadarma
                </motion.span>
              </Link>
            </div>
          </motion.div>

          {/* ===== BLOG SELANJUTNYA - PREVIOUS PAGE ===== */}
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
                href="/blog/memilih-jurusan" 
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
                    Mengapa saya memilih jurusan tersebut
                  </span>
                  <span style={{
                    fontSize: '0.95rem',
                    color: '#666666',
                    marginTop: '4px',
                  }}>
                    Alasan di balik keputusan memilih program studi
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
                          background: userReactions.includes(emoticon.id) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                          border: userReactions.includes(emoticon.id) ? '1px solid white' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          padding: '16px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '2.5rem' }}>{emoticon.emoji}</span>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: userReactions.includes(emoticon.id) ? 'white' : '#999999' 
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
                        background: userReactions.includes(id) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                        border: userReactions.includes(id) ? '1px solid white' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '30px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{emoticon.emoji}</span>
                      <span style={{ 
                        fontSize: '0.95rem', 
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
                        background: comment.likedBy?.includes(user?.uid) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                        border: comment.likedBy?.includes(user?.uid) ? '1px solid white' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '30px',
                        padding: '8px 16px',
                        cursor: user ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill={comment.likedBy?.includes(user?.uid) ? "white" : "none"} 
                        stroke="white" 
                        strokeWidth="1"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span style={{ 
                        color: 'white',
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
                                  color: reply.likedBy?.includes(user?.uid) ? 'white' : '#666666',
                                  fontSize: '0.85rem',
                                  cursor: user ? 'pointer' : 'not-allowed',
                                  padding: '4px 8px',
                                  borderRadius: '20px',
                                  backgroundColor: reply.likedBy?.includes(user?.uid) ? 'rgba(255,255,255,0.1)' : 'transparent',
                                }}
                              >
                                <svg 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24" 
                                  fill={reply.likedBy?.includes(user?.uid) ? "white" : "none"} 
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
