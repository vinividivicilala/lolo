
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

  // State untuk Save
  const [saveCount, setSaveCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveHistory, setShowSaveHistory] = useState(false);
  const [saveHistory, setSaveHistory] = useState<any[]>([]);

  // State untuk Pesan ke Penulis
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [showUserMessageHistory, setShowUserMessageHistory] = useState(false);

  // Format tanggal
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Email penulis
  const authorEmail = "faridardiansyah061@gmail.com";

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
      // Initialize save count
      initializeSaveCount(db);
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
  // 4. INITIALIZE SAVE COUNT
  // ============================================
  const initializeSaveCount = async (db: any) => {
    try {
      const saveRef = doc(db, "blogSaves", "gunadarma-article");
      const docSnap = await getDoc(saveRef);
      
      if (!docSnap.exists()) {
        await setDoc(saveRef, {
          articleId: "gunadarma-article",
          count: 0,
          createdAt: Timestamp.now()
        });
        setSaveCount(0);
      } else {
        setSaveCount(docSnap.data().count || 0);
      }
    } catch (error) {
      console.error("Error initializing save count:", error);
    }
  };

  // ============================================
  // 5. LOAD SHARE COUNT (REAL-TIME)
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
  // 6. LOAD SAVE COUNT (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const saveRef = doc(firebaseDb, "blogSaves", "gunadarma-article");
    
    const unsubscribe = onSnapshot(saveRef, (doc) => {
      if (doc.exists()) {
        setSaveCount(doc.data().count || 0);
      }
    }, (error) => {
      console.error("Error loading save count:", error);
    });

    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized]);

  // ============================================
  // 7. LOAD USER SAVE STATUS
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized || !user) return;

    const loadUserSaveStatus = async () => {
      try {
        const userSaveRef = doc(firebaseDb, "userSaves", `${user.uid}_gunadarma-article`);
        const docSnap = await getDoc(userSaveRef);
        if (docSnap.exists()) {
          setIsSaved(true);
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        console.error("Error loading user save status:", error);
      }
    };

    loadUserSaveStatus();
  }, [firebaseDb, firebaseInitialized, user]);

  // ============================================
  // 8. LOAD SAVE HISTORY
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized || !user) return;

    const loadSaveHistory = async () => {
      try {
        const savesRef = collection(firebaseDb, "userSaves");
        const q = query(
          savesRef,
          where("userId", "==", user.uid),
          orderBy("savedAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          savedAt: doc.data().savedAt?.toDate?.() || new Date()
        }));
        setSaveHistory(history);
      } catch (error) {
        console.error("Error loading save history:", error);
      }
    };

    if (showSaveHistory) {
      loadSaveHistory();
    }
  }, [firebaseDb, firebaseInitialized, user, showSaveHistory]);

  // ============================================
  // 9. AUTH STATE LISTENER
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
  // 10. LOAD REACTIONS FROM FIREBASE (REAL-TIME)
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
  // 11. LOAD USER REACTIONS
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
  // 12. LOAD COMMENTS FROM FIREBASE (REAL-TIME)
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
  // 13. LOAD MESSAGES TO AUTHOR (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const messagesRef = collection(firebaseDb, "authorMessages");
    const q = query(
      messagesRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setMessages(messagesData);
      
      // Hitung pesan yang belum dibaca (jika user adalah penulis)
      if (user && user.email === authorEmail) {
        const unread = messagesData.filter((msg: any) => !msg.isRead).length;
        setUnreadCount(unread);
      }

      // Filter pesan untuk user yang sedang login (bukan penulis)
      if (user && user.email !== authorEmail) {
        const userMsgs = messagesData.filter((msg: any) => msg.userId === user.uid);
        setUserMessages(userMsgs);
      }
    }, (error) => {
      console.error("Error loading messages:", error);
    });

    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized, user]);

  // ============================================
  // 14. HANDLE REACTION (EMOTICON)
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
  // 15. HANDLE GOOGLE LOGIN
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
  // 16. HANDLE LOGOUT
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
  // 17. HANDLE ADD COMMENT
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
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random&color=fff`,
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
  // 18. HANDLE ADD REPLY
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
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random&color=fff`,
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
  // 19. HANDLE LIKE COMMENT
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
  // 20. HANDLE SAVE
  // ============================================
  const handleSave = async () => {
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb) return;

    try {
      const saveRef = doc(firebaseDb, "blogSaves", "gunadarma-article");
      const userSaveRef = doc(firebaseDb, "userSaves", `${user.uid}_gunadarma-article`);

      if (isSaved) {
        // Unsave
        await updateDoc(saveRef, {
          count: increment(-1)
        });
        await deleteDoc(userSaveRef);
        setIsSaved(false);
      } else {
        // Save
        await updateDoc(saveRef, {
          count: increment(1)
        });
        await setDoc(userSaveRef, {
          userId: user.uid,
          articleId: "gunadarma-article",
          articleTitle: "Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma",
          articleUrl: typeof window !== 'undefined' ? window.location.href : '',
          savedAt: Timestamp.now()
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error handling save:", error);
    }
  };

  // ============================================
  // 21. HANDLE SHARE
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

  const shareToTwitter = async () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma');
    const shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    
    await incrementShareCount();
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareModal(false);
  };

  // ============================================
  // 22. HANDLE SEND MESSAGE TO AUTHOR
  // ============================================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb || !newMessage.trim()) return;

    setMessageLoading(true);
    
    try {
      const messagesRef = collection(firebaseDb, "authorMessages");
      
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userEmail: user.email,
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random&color=fff`,
        message: newMessage,
        isRead: false,
        replies: [],
        createdAt: Timestamp.now()
      });

      setNewMessage("");
      
      // Tampilkan notifikasi
      showNotification("Pesan berhasil dikirim ke penulis");
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("Gagal mengirim pesan", "error");
    } finally {
      setMessageLoading(false);
    }
  };

  // ============================================
  // 23. HANDLE REPLY TO MESSAGE (UNTUK PENULIS)
  // ============================================
  const handleReplyToMessage = async (messageId: string) => {
    if (!user || user.email !== authorEmail) return;
    if (!firebaseDb || !replyMessage.trim()) return;

    try {
      const messageRef = doc(firebaseDb, "authorMessages", messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      const replyData = {
        id: `${Date.now()}_${user.uid}`,
        userId: user.uid,
        userName: user.displayName || "Farid Ardiansyah",
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=Farid+Ardiansyah&background=random&color=fff`,
        text: replyMessage,
        createdAt: Timestamp.now()
      };

      await updateDoc(messageRef, {
        replies: arrayUnion(replyData),
        isRead: true
      });

      setReplyMessage("");
      setSelectedMessage(null);
      
      // Tampilkan notifikasi
      showNotification("Balasan berhasil dikirim");
    } catch (error) {
      console.error("Error replying to message:", error);
      showNotification("Gagal mengirim balasan", "error");
    }
  };

  // ============================================
  // 24. HANDLE MARK AS READ (UNTUK PENULIS)
  // ============================================
  const handleMarkAsRead = async (messageId: string) => {
    if (!user || user.email !== authorEmail) return;
    if (!firebaseDb) return;

    try {
      const messageRef = doc(firebaseDb, "authorMessages", messageId);
      await updateDoc(messageRef, {
        isRead: true
      });
      
      showNotification("Pesan ditandai telah dibaca");
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // ============================================
  // 25. NOTIFICATION FUNCTION
  // ============================================
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    // Buat elemen notifikasi
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.left = "20px";
    notification.style.backgroundColor = "rgba(255,255,255,0.1)";
    notification.style.color = "white";
    notification.style.padding = "12px 24px";
    notification.style.borderRadius = "30px";
    notification.style.fontSize = "0.95rem";
    notification.style.zIndex = "10001";
    notification.style.border = "1px solid rgba(255,255,255,0.2)";
    notification.style.backdropFilter = "blur(10px)";
    notification.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    notification.style.animation = "slideIn 0.3s ease";
    notification.innerText = message;

    document.body.appendChild(notification);

    // Hapus setelah 3 detik
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // ============================================
  // 26. SCROLL HANDLER
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
  // 27. SVG COMPONENTS
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

  // ===== NORTH WEST ARROW UNTUK TEKS BERJALAN =====
  const NorthWestArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M17 17L7 7" stroke="white"/>
      <path d="M17 7H7" stroke="white"/>
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

  const SaveIcon = ({ width, height, filled }: { width: number, height: number, filled?: boolean }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={filled ? "white" : "none"} stroke="white" strokeWidth="1.5">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const HistoryIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const MessageIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const SendIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );

  const ReplyIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <polyline points="10 11 13 14 10 17"/>
    </svg>
  );

  const CheckIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  // Twitter Icon
  const TwitterIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  // ============================================
  // 28. RANGKUMAN SECTIONS
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
    role: "Penulis",
    bio: "Manusia Biasa",
    email: authorEmail
  };

  // ============================================
  // 29. LOADING STATE
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
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ color: 'white', fontSize: '1rem' }}
        >
          Loading...
        </motion.div>
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
      paddingTop: isMobile ? '120px' : '180px', // Tambah padding top untuk memberi ruang teks berjalan
    }}>
      
      {/* ===== TEKS BERJALAN - LEBIH BESAR DENGAN PANAH ===== */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.95)',
        color: 'white',
        padding: '20px 0', // Padding lebih besar
        borderBottom: '2px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100vw',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}>
        <motion.div
          animate={{
            x: [0, -2500] // Geser lebih jauh
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop"
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '60px', // Jarak antar elemen lebih besar
            fontSize: isMobile ? '1.8rem' : '2.5rem', // Ukuran font lebih besar
            fontWeight: 'bold',
            letterSpacing: '2px',
            paddingLeft: '30px',
          }}
        >
          {/* Elemen teks berjalan dengan arrow besar */}
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
        </motion.div>
      </div>

      {/* HEADER - HALAMAN UTAMA & USER - DIBERI JARAK DARI TEKS BERJALAN */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '100px' : '120px', // Turunkan posisi (dari 80px jadi 120px)
        right: isMobile ? '20px' : '40px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        maxWidth: 'calc(100% - 80px)',
      }}>
        {/* Message to Author Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMessageModal(!showMessageModal)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: showMessageModal ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '40px',
            padding: '10px 24px',
            color: 'white',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <MessageIcon width={20} height={20} />
          <span>Pesan ke Penulis</span>
          {user && user.email === authorEmail && unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.75rem',
                minWidth: '20px',
                height: '20px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* Save Button with Count */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: isSaved ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '40px',
            padding: '10px 24px',
            color: 'white',
            fontSize: '0.95rem',
            cursor: user ? 'pointer' : 'pointer',
          }}
        >
          <SaveIcon width={20} height={20} filled={isSaved} />
          <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
          <span
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              color: 'white',
            }}
          >
            {saveCount}
          </span>
        </motion.button>

        {/* History Button */}
        {user && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSaveHistory(!showSaveHistory)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '40px',
              padding: '10px 20px',
              color: 'white',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            <HistoryIcon width={18} height={18} />
            <span>Riwayat</span>
          </motion.button>
        )}

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
          <span
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              color: 'white',
            }}
          >
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
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random&color=fff`} 
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
                border: '1px solid rgba(255,255,255,0.2)',
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

      {/* MESSAGE MODAL - UNTUK KIRIM PESAN KE PENULIS DAN LIHAT RIWAYAT */}
      <AnimatePresence>
        {showMessageModal && (
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
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: '#1a1a1a',
                borderRadius: '32px',
                padding: '40px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
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
                  <motion.h3 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'normal',
                      color: 'white',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {user && user.email === authorEmail ? 'Pesan dari Pembaca' : 'Pesan ke Penulis'}
                  </motion.h3>
                  <motion.p
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontSize: '0.95rem',
                      color: '#999999',
                      margin: 0,
                    }}
                  >
                    {user && user.email === authorEmail 
                      ? `${messages.length} pesan • ${unreadCount} belum dibaca`
                      : user 
                        ? `${userMessages.length} pesan • Kirim pesan baru atau lihat riwayat`
                        : 'Login untuk mengirim pesan'}
                  </motion.p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMessageModal(false)}
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

              {/* Tabs untuk pengirim pesan (bukan penulis) */}
              {user && user.email !== authorEmail && (
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '30px',
                  borderBottom: '1px solid #333333',
                  paddingBottom: '20px',
                }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowUserMessageHistory(false);
                      setNewMessage("");
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: !showUserMessageHistory ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '30px',
                      color: 'white',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                    }}
                  >
                    Kirim Pesan Baru
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMessageHistory(true)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: showUserMessageHistory ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '30px',
                      color: 'white',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <HistoryIcon width={16} height={16} />
                    <span>Riwayat Pesan ({userMessages.length})</span>
                  </motion.button>
                </div>
              )}

              {/* Form Kirim Pesan Baru (untuk pembaca) */}
              {user && user.email !== authorEmail && !showUserMessageHistory && (
                <motion.form
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onSubmit={handleSendMessage}
                  style={{
                    marginBottom: '30px',
                  }}
                >
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tulis pesan Anda untuk Farid Ardiansyah..."
                    rows={4}
                    required
                    style={{
                      width: '100%',
                      padding: '20px',
                      background: '#2a2a2a',
                      border: '1px solid #444444',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical',
                      marginBottom: '15px',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={messageLoading || !newMessage.trim()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 32px',
                        background: messageLoading || !newMessage.trim() ? '#333333' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '30px',
                        color: messageLoading || !newMessage.trim() ? '#999999' : 'white',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: messageLoading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <SendIcon width={18} height={18} />
                      <span>{messageLoading ? 'Mengirim...' : 'Kirim Pesan'}</span>
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* Riwayat Pesan untuk Pengirim (pembaca) */}
              {user && user.email !== authorEmail && showUserMessageHistory && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  {userMessages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#666666',
                        border: '1px dashed #333333',
                        borderRadius: '24px',
                      }}
                    >
                      <MessageIcon width={40} height={40} />
                      <p style={{ fontSize: '1.1rem', margin: '15px 0 0 0' }}>
                        Belum ada pesan yang dikirim.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUserMessageHistory(false)}
                        style={{
                          marginTop: '20px',
                          padding: '10px 24px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '30px',
                          color: 'white',
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                        }}
                      >
                        Kirim Pesan Baru
                      </motion.button>
                    </motion.div>
                  ) : (
                    userMessages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          padding: '24px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '24px',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {/* Header Pesan */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '15px',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}>
                            <img 
                              src={msg.userPhoto}
                              alt={msg.userName}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                            <div>
                              <span style={{
                                fontSize: '1.1rem',
                                fontWeight: '500',
                                color: 'white',
                                display: 'block',
                                marginBottom: '4px',
                              }}>
                                {msg.userName} (Anda)
                              </span>
                              <span style={{
                                fontSize: '0.85rem',
                                color: '#999999',
                              }}>
                                {msg.createdAt.toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {msg.isRead ? (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '20px',
                              color: '#999999',
                              fontSize: '0.8rem',
                            }}>
                              <CheckIcon width={12} height={12} />
                              <span>Telah dibaca</span>
                            </span>
                          ) : (
                            <span style={{
                              padding: '4px 10px',
                              background: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '20px',
                              color: 'white',
                              fontSize: '0.8rem',
                            }}>
                              Belum dibaca
                            </span>
                          )}
                        </div>

                        {/* Isi Pesan */}
                        <p style={{
                          fontSize: '1rem',
                          lineHeight: '1.6',
                          color: '#e0e0e0',
                          margin: '0 0 20px 0',
                          padding: '15px',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: '16px',
                          borderLeft: '2px solid rgba(255,255,255,0.2)',
                        }}>
                          {msg.message}
                        </p>

                        {/* Balasan dari Penulis */}
                        {msg.replies && msg.replies.length > 0 && (
                          <div style={{
                            marginTop: '15px',
                            paddingLeft: '20px',
                            borderLeft: '2px solid rgba(255,255,255,0.2)',
                          }}>
                            <span style={{
                              fontSize: '0.9rem',
                              color: '#999999',
                              display: 'block',
                              marginBottom: '10px',
                            }}>
                              Balasan dari Penulis:
                            </span>
                            {msg.replies.map((reply: any) => (
                              <div key={reply.id} style={{
                                marginBottom: '10px',
                                padding: '10px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '5px',
                                }}>
                                  <img 
                                    src={reply.userPhoto}
                                    alt={reply.userName}
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                    }}
                                  />
                                  <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    color: 'white',
                                  }}>
                                    {reply.userName}
                                  </span>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: '#666666',
                                  }}>
                                    {reply.createdAt?.toDate?.()?.toLocaleDateString?.('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p style={{
                                  fontSize: '0.95rem',
                                  color: '#cccccc',
                                  margin: 0,
                                }}>
                                  {reply.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Daftar Pesan untuk Penulis */}
              {user && user.email === authorEmail && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#666666',
                        border: '1px dashed #333333',
                        borderRadius: '24px',
                      }}
                    >
                      <MessageIcon width={40} height={40} />
                      <p style={{ fontSize: '1.1rem', margin: '15px 0 0 0' }}>
                        Belum ada pesan dari pembaca.
                      </p>
                    </motion.div>
                  ) : (
                    messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          padding: '24px',
                          background: msg.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                          borderRadius: '24px',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {/* Header Pesan */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '15px',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}>
                            <img 
                              src={msg.userPhoto}
                              alt={msg.userName}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                            <div>
                              <span style={{
                                fontSize: '1.1rem',
                                fontWeight: '500',
                                color: 'white',
                                display: 'block',
                                marginBottom: '4px',
                              }}>
                                {msg.userName}
                              </span>
                              <span style={{
                                fontSize: '0.85rem',
                                color: '#999999',
                              }}>
                                {msg.createdAt.toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {!msg.isRead && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleMarkAsRead(msg.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                color: 'white',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                              }}
                            >
                              <CheckIcon width={14} height={14} />
                              <span>Tandai Dibaca</span>
                            </motion.button>
                          )}
                        </div>

                        {/* Isi Pesan */}
                        <p style={{
                          fontSize: '1rem',
                          lineHeight: '1.6',
                          color: '#e0e0e0',
                          margin: '0 0 20px 0',
                          padding: '15px',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: '16px',
                          borderLeft: '2px solid rgba(255,255,255,0.2)',
                        }}>
                          {msg.message}
                        </p>

                        {/* Balasan */}
                        {msg.replies && msg.replies.length > 0 && (
                          <div style={{
                            marginTop: '15px',
                            paddingLeft: '20px',
                            borderLeft: '2px solid rgba(255,255,255,0.2)',
                          }}>
                            <span style={{
                              fontSize: '0.9rem',
                              color: '#999999',
                              display: 'block',
                              marginBottom: '10px',
                            }}>
                              Balasan Anda:
                            </span>
                            {msg.replies.map((reply: any) => (
                              <div key={reply.id} style={{
                                marginBottom: '10px',
                                padding: '10px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '5px',
                                }}>
                                  <img 
                                    src={reply.userPhoto}
                                    alt={reply.userName}
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                    }}
                                  />
                                  <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    color: 'white',
                                  }}>
                                    {reply.userName}
                                  </span>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: '#666666',
                                  }}>
                                    {reply.createdAt?.toDate?.()?.toLocaleDateString?.('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p style={{
                                  fontSize: '0.95rem',
                                  color: '#cccccc',
                                  margin: 0,
                                }}>
                                  {reply.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Form Balasan */}
                        {selectedMessage === msg.id ? (
                          <div style={{
                            marginTop: '20px',
                          }}>
                            <textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Tulis balasan Anda..."
                              rows={2}
                              style={{
                                width: '100%',
                                padding: '12px',
                                background: '#2a2a2a',
                                border: '1px solid #444444',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none',
                                resize: 'vertical',
                                marginBottom: '10px',
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
                                onClick={() => {
                                  setSelectedMessage(null);
                                  setReplyMessage("");
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: 'none',
                                  border: '1px solid rgba(255,255,255,0.2)',
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
                                onClick={() => handleReplyToMessage(msg.id)}
                                disabled={!replyMessage.trim()}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 24px',
                                  background: replyMessage.trim() ? 'rgba(255,255,255,0.1)' : '#333333',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '20px',
                                  color: replyMessage.trim() ? 'white' : '#999999',
                                  fontSize: '0.9rem',
                                  fontWeight: '500',
                                  cursor: replyMessage.trim() ? 'pointer' : 'not-allowed',
                                }}
                              >
                                <ReplyIcon width={16} height={16} />
                                <span>Kirim Balasan</span>
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedMessage(msg.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: 'none',
                              border: 'none',
                              color: 'white',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              padding: '8px 0',
                              marginTop: '10px',
                            }}
                          >
                            <ReplyIcon width={16} height={16} />
                            <span>Balas Pesan</span>
                          </motion.button>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAVE HISTORY MODAL */}
      <AnimatePresence>
        {showSaveHistory && (
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
            onClick={() => setShowSaveHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: '#1a1a1a',
                borderRadius: '32px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
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
                <motion.h3 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'normal',
                    color: 'white',
                    margin: 0,
                  }}
                >
                  Riwayat Simpanan
                </motion.h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSaveHistory(false)}
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

              {saveHistory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#666666',
                    border: '1px dashed #333333',
                    borderRadius: '24px',
                  }}
                >
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>📌</span>
                  <p style={{ fontSize: '1.2rem', margin: 0 }}>Belum ada artikel yang disimpan.</p>
                </motion.div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}>
                  {saveHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Link 
                        href={item.articleUrl || '#'}
                        style={{ textDecoration: 'none' }}
                      >
                        <h4 style={{
                          fontSize: '1.2rem',
                          fontWeight: '500',
                          color: 'white',
                          margin: '0 0 8px 0',
                        }}>
                          {item.articleTitle}
                        </h4>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#999999',
                          margin: 0,
                        }}>
                          Disimpan pada: {item.savedAt?.toLocaleDateString?.('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: '#1a1a1a',
                borderRadius: '32px',
                padding: '40px',
                maxWidth: '400px',
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
                  <motion.h3 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'normal',
                      color: 'white',
                      margin: '0 0 8px 0',
                    }}
                  >
                    Bagikan Artikel
                  </motion.h3>
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontSize: '0.95rem',
                      color: '#999999',
                    }}
                  >
                    {shareCount} orang telah membagikan artikel ini
                  </motion.span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
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
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  marginBottom: '30px',
                }}
              >
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
                      background: copySuccess ? 'rgba(0,204,136,0.2)' : 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {copySuccess ? 'Tersalin!' : 'Salin Link'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Twitter Share */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p style={{
                  color: '#999999',
                  marginBottom: '20px',
                  fontSize: '0.95rem',
                }}>
                  Bagikan ke Twitter:
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareToTwitter}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '15px 25px',
                    width: '100%',
                    background: 'rgba(29,161,242,0.2)',
                    border: '1px solid rgba(29,161,242,0.3)',
                    borderRadius: '16px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <TwitterIcon size={24} />
                  <span>Bagikan ke Twitter</span>
                </motion.button>
              </motion.div>
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
        padding: isMobile ? '20px 0 40px' : '40px 0 60px', // Kurangi padding top karena sudah di container utama
      }}>
        
        {/* SIDEBAR KIRI - RANGKUMAN (DIPERBAIKI: OVERFLOW-X HIDDEN) */}
        <div style={{
          flex: isMobile ? '1' : '0 0 280px',
          position: isMobile ? 'relative' : 'sticky',
          top: isMobile ? 'auto' : '160px',
          alignSelf: 'flex-start',
          height: isMobile ? 'auto' : 'calc(100vh - 210px)',
          overflowY: isMobile ? 'visible' : 'auto',
          overflowX: 'hidden', // PENTING: Hilangkan scrollbar horizontal
          paddingRight: '20px',
          maxWidth: '100%', // Pastikan tidak melebihi lebar container
          boxSizing: 'border-box', // Pastikan padding tidak menambah lebar
       minWidth: 0,
        }}>
          
          {/* Blog Title */}
          <div style={{
            marginBottom: '50px',
            width: '100%', // Pastikan lebar penuh
            overflow: 'hidden', // Hindari overflow
          }}>
            <h1 style={{
              fontSize: isMobile ? '4rem' : '6rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
              lineHeight: '0.9',
              letterSpacing: '-2px',
              wordWrap: 'break-word', // Pastikan teks panjang tidak overflow
  whiteSpace: 'pre-wrap', // atau 'normal' — hindari 'nowrap' jika tidak diperlukan
  overflow: 'hidden',
      
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
              width: '100%',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap', // Wrap jika perlu
              }}>
                <CalendarIcon width={18} height={18} />
                <span style={{ wordBreak: 'break-word' }}>{formattedDate}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
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
                  width: '100%',
                  overflow: 'visible', // Tooltip perlu visible
                }}
                onMouseEnter={() => setShowAuthorTooltip(true)}
                onMouseLeave={() => setShowAuthorTooltip(false)}
              >
                <motion.img 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  src={`https://ui-avatars.com/api/?name=Farid+Ardiansyah&background=random&color=fff&size=32`}
                  alt="Farid Ardiansyah"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    flexShrink: 0, // Jangan mengecil
                  }}
                />
                <div style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  <motion.span
                    whileHover={{ x: 5 }}
                    style={{
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '500',
                      display: 'block',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Farid Ardiansyah
                  </motion.span>
                  <span style={{
                    color: '#999999',
                    fontSize: '0.85rem',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    Penulis
                  </span>
                </div>

                {/* Author Tooltip - tetap sama */}
                <AnimatePresence>
                  {showAuthorTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '15px',
                        background: '#1a1a1a',
                        border: '1px solid #333333',
                        borderRadius: '16px',
                        padding: '20px',
                        width: '250px',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 10 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          marginBottom: '15px',
                        }}
                      >
                        <img 
                          src={`https://ui-avatars.com/api/?name=Farid+Ardiansyah&background=random&color=fff&size=48`}
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
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '4px',
                          }}>
                            Farid Ardiansyah
                          </span>
                          <span style={{
                            color: '#999999',
                            fontSize: '0.85rem',
                          }}>
                            {authorBio.role}
                          </span>
                        </div>
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                          color: '#cccccc',
                          fontSize: '0.9rem',
                          lineHeight: '1.5',
                          margin: '0 0 10px 0',
                          fontStyle: 'italic',
                        }}
                      >
                        "{authorBio.bio}"
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#666666',
                          fontSize: '0.85rem',
                        }}
                      >
                        <MessageIcon width={14} height={14} />
                        <span>Kirim pesan melalui tombol di atas</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          <div style={{
            marginBottom: '25px',
            width: '100%',
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
            width: '100%',
            overflow: 'hidden',
          }}>
            {rangkumanSections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '5px 0',
                  color: activeSection === section.id ? 'white' : '#999999',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 'normal',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', // Mencegah teks wrap ke bawah
                }}
              >
                {section.title}
              </motion.button>
            ))}
          </div>
        </div>

        {/* KONTEN KANAN - ARTIKEL */}
        <div style={{
          flex: '1',
          maxWidth: isMobile ? '100%' : '700px',
        }}>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: isMobile ? '2rem' : '2.8rem',
              fontWeight: 'normal',
              color: 'white',
              marginBottom: '40px',
              lineHeight: '1.2',
            }}
          >
            Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma
          </motion.h2>

          {/* KONTEN ARTIKEL - LENGKAP */}
          <div style={{
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            lineHeight: '1.8',
            color: '#e0e0e0',
          }}>
            <section 
              id="pendahuluan"
              ref={el => sectionRefs.current.pendahuluan = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Saat pertama kali mendengar nama Universitas Gunadarma, yang terbayang di benakku adalah kampus dengan reputasi kuat di bidang teknologi dan komputer. Sebagai salah satu perguruan tinggi swasta terkemuka di Indonesia, Gunadarma telah melahirkan ribuan lulusan yang sukses di berbagai bidang, terutama di industri teknologi. Namun, seperti apa sebenarnya rasanya menjadi mahasiswa di universitas ini? Apakah sesuai dengan ekspektasi? Ataukah ada cerita-cerita tak terduga di balik gedung-gedung kampusnya yang ikonik?
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Dalam artikel ini, aku akan berbagi pengalaman pribadi selama menjalani perkuliahan di Universitas Gunadarma. Dari hari pertama masuk hingga saat-saat menjelang kelulusan, ada banyak hal yang membentuk cara pandangku tentang dunia perkuliahan, tentang teknologi, dan tentang kehidupan itu sendiri. Tulisan ini bukan hanya sekadar catatan perjalanan, tetapi juga refleksi atas apa yang kudapatkan dari kampus yang telah menjadi rumah kedua selama beberapa tahun terakhir.
              </p>
            </section>
            
            <section 
              id="sejarah"
              ref={el => sectionRefs.current.sejarah = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Universitas Gunadarma didirikan pada tahun 1981 dengan nama Sekolah Tinggi Manajemen Informatika dan Komputer (STMIK) Gunadarma. Seiring perkembangannya, pada tahun 1993, Gunadarma resmi menjadi universitas dan terus berkembang hingga kini memiliki beberapa kampus yang tersebar di berbagai lokasi strategis di Jakarta, Depok, dan sekitarnya. Reputasi Gunadarma sebagai kampus teknologi bukanlah isapan jempol belaka. Banyak perusahaan teknologi, baik nasional maupun multinasional, yang secara aktif merekrut lulusan Gunadarma.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
              Yang membuatku memilih Gunadarma adalah reputasinya yang kuat di bidang IT. Saat masih duduk di bangku SMA, aku sering mendengar bahwa lulusan Gunadarma "tidak diragukan lagi" kemampuannya dalam programming dan pengembangan sistem. Banyak senior yang kuliah di sini dan kini bekerja di perusahaan-perusahaan ternama. Reputasi ini menjadi salah satu alasan utama mengapa aku memantapkan pilihan untuk berkuliah di Gunadarma, meskipun sebenarnya ada beberapa pilihan lain yang juga menarik.
              </p>
            </section>
            
            <section 
              id="suasana"
              ref={el => sectionRefs.current.suasana = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Suasana kampus Gunadarma... bagaimana ya mendeskripsikannya? Mungkin kata yang paling tepat adalah "dinamis". Setiap sudut kampus selalu dipenuhi dengan aktivitas mahasiswa. Di kantin, terdengar obrolan tentang tugas kuliah, rencana liburan, atau sekadar gosip terkini. Di taman-taman kampus, terlihat mahasiswa yang nongkrong sambil mengerjakan tugas kelompok. Di perpustakaan, suasana hening namun terasa produktif.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Salah satu hal yang paling kuingat adalah suasana saat ujian tiba. Kampus yang biasanya ramai dan penuh tawa, tiba-tiba berubah menjadi "lautan wajah tegang". Semua orang sibuk belajar, baik di dalam ruangan maupun di sudut-sudut kampus. Suasana kompetitif yang sehat ini justru membuatku semakin termotivasi untuk belajar lebih giat. Aku ingat betul bagaimana kami saling berbagi catatan, bertukar pikiran, dan membantu teman yang kesulitan memahami materi. Ada rasa kebersamaan yang kuat meskipun kami semua bersaing untuk mendapatkan nilai terbaik.
              </p>
            </section>
            
            <section 
              id="akademik"
              ref={el => sectionRefs.current.akademik = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Kehidupan akademik di Gunadarma menurutku cukup menantang namun tetap menyenangkan. Sistem kredit semester (SKS) yang diterapkan memberikan fleksibilitas bagi mahasiswa untuk mengatur beban studi mereka. Aku pribadi menyukai sistem ini karena bisa menyesuaikan dengan kemampuan dan kebutuhan. Ada semester di mana aku mengambil banyak SKS, ada pula semester di mana aku sengaja mengambil sedikit agar bisa fokus pada kegiatan lain seperti organisasi atau magang.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Metode pengajaran di Gunadarma cukup bervariasi. Ada dosen yang lebih suka dengan metode ceramah, ada juga yang aktif menggunakan diskusi dan studi kasus. Beberapa mata kuliah bahkan mewajibkan mahasiswa untuk membuat proyek nyata, seperti membuat aplikasi sederhana atau menganalisis sistem informasi di perusahaan. Tugas-tugas seperti ini sangat membantuku untuk memahami aplikasi praktis dari teori yang dipelajari di kelas.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Laboratorium komputer di Gunadarma juga menjadi salah satu fasilitas pendukung utama dalam kehidupan akademik. Dengan peralatan yang memadai dan akses yang cukup luas, mahasiswa dapat bereksperimen dan mengembangkan keterampilan teknis mereka. Aku sering menghabiskan waktu di lab, baik untuk mengerjakan tugas maupun sekadar mengeksplorasi teknologi baru yang sedang tren.
              </p>
            </section>
            
            <section 
              id="dosen"
              ref={el => sectionRefs.current.dosen = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Berbicara tentang dosen di Gunadarma, aku merasa sangat beruntung karena banyak dari mereka yang tidak hanya pintar secara akademis, tetapi juga memiliki pengalaman praktis di industri. Ada dosen yang sebelumnya bekerja sebagai software engineer di perusahaan multinasional, ada juga yang masih aktif sebagai konsultan di bidang teknologi. Pengalaman mereka ini menjadi nilai tambah yang sangat berharga dalam proses belajar-mengajar.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Aku ingat betul bagaimana seorang dosen pemrograman yang sangat bersemangat mengajarkan kami tentang algoritma. Beliau tidak hanya memberikan teori, tetapi juga menunjukkan bagaimana algoritma tersebut diterapkan dalam aplikasi-aplikasi nyata yang kita gunakan sehari-hari. Pendekatan seperti ini membuat materi yang tadinya terasa abstrak menjadi lebih konkret dan mudah dipahami.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Ada juga dosen yang terkenal killer, yang suka memberi tugas berat dan menuntut mahasiswa untuk berpikir kritis. Saat itu mungkin kita merasa terbebani, tapi setelah lulus baru sadar bahwa "kekerasan" beliau justru mempersiapkan kita menghadapi dunia kerja yang sesungguhnya. Tugas-tugas berat itu mengajarkan kami tentang manajemen waktu, kerja keras, dan ketahanan menghadapi tekanan.
              </p>
            </section>
            
            <section 
              id="teman"
              ref={el => sectionRefs.current.teman = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Salah satu hal paling berharga yang kudapatkan selama kuliah di Gunadarma adalah teman-teman. Mereka berasal dari berbagai latar belakang, dengan berbagai keunikan dan kelebihan masing-masing. Ada yang jago coding, ada yang mahir desain, ada yang pandai berorganisasi, dan ada juga yang sekadar jago bikin suasana cair. Perpaduan ini menciptakan dinamika yang seru dalam setiap interaksi.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Tugas kelompok menjadi ajang untuk belajar bekerja sama dengan orang lain. Tidak selalu mulus, pasti ada gesekan dan perbedaan pendapat. Tapi justru dari situ kami belajar bagaimana berkompromi, menghargai pendapat orang lain, dan mencapai tujuan bersama. Beberapa teman kelompok bahkan menjadi teman dekat hingga sekarang, dan masih sering berkomunikasi meskipun sudah sibuk dengan urusan masing-masing.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Relasi yang dibangun selama kuliah juga menjadi aset berharga di masa depan. Banyak dari kami yang sekarang bekerja di berbagai perusahaan, dan koneksi ini sering kali bermanfaat, baik untuk sekadar bertukar informasi lowongan kerja maupun untuk kolaborasi profesional. Bahkan ada beberapa teman yang akhirnya menjadi rekan bisnis setelah lulus. Benar-benar tak ternilai harganya.
              </p>
            </section>
            
            <section 
              id="fasilitas"
              ref={el => sectionRefs.current.fasilitas = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Fasilitas kampus menjadi salah satu faktor penting dalam menunjang kegiatan perkuliahan. Di Gunadarma, fasilitas yang disediakan cukup lengkap. Mulai dari ruang kuliah yang nyaman dengan pendingin udara dan proyektor di setiap kelas, perpustakaan dengan koleksi buku dan jurnal yang memadai, laboratorium komputer dengan spesifikasi tinggi, hingga akses internet yang cepat di seluruh area kampus.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Aku pribadi paling sering menghabiskan waktu di perpustakaan. Selain untuk membaca buku, perpustakaan juga menjadi tempat favorit untuk belajar karena suasananya yang tenang dan kondusif. Koleksi bukunya juga lengkap, mulai dari buku teks kuliah, buku-buku populer tentang teknologi, hingga jurnal-jurnal ilmiah terkini. Sistem peminjaman yang terkomputerisasi juga memudahkan mahasiswa untuk mencari dan meminjam buku yang dibutuhkan.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Untuk menunjang kreativitas mahasiswa, Gunadarma juga menyediakan fasilitas seperti ruang diskusi, studio multimedia, dan area komunal yang nyaman. Ruang diskusi sangat membantu saat kami mengerjakan tugas kelompok, sementara studio multimedia menjadi tempat favorit bagi mahasiswa yang tertarik dengan produksi video dan audio. Area komunal di beberapa titik kampus juga menjadi tempat nongkrong favorit untuk melepas penat di sela-sela kuliah.
              </p>
            </section>
            
            <section 
              id="organisasi"
              ref={el => sectionRefs.current.organisasi = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Selain kegiatan akademik, Gunadarma juga memiliki berbagai organisasi dan kegiatan kemahasiswaan yang menarik. Ada himpunan mahasiswa jurusan (HMJ), unit kegiatan mahasiswa (UKM) di berbagai bidang seperti olahraga, seni, keagamaan, dan masih banyak lagi. Aku sendiri cukup aktif di organisasi mahasiswa jurusan, dan pengalaman itu menjadi salah satu yang paling berkesan selama kuliah.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Melalui organisasi, aku belajar banyak hal yang tidak diajarkan di kelas: kepemimpinan, manajemen proyek, komunikasi publik, dan kemampuan bekerja dalam tim. Kami sering mengadakan acara-acara seperti seminar, workshop, atau kompetisi yang melibatkan mahasiswa dari berbagai jurusan. Mengkoordinasikan acara-acara ini tidak mudah, tapi hasilnya sangat memuaskan dan memberikan banyak pelajaran berharga.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Selain itu, Gunadarma juga rutin mengadakan kegiatan tingkat universitas seperti pekan olahraga, pekan seni, dan seminar nasional. Kegiatan-kegiatan ini menjadi ajang untuk berinteraksi dengan mahasiswa dari jurusan lain dan memperluas pergaulan. Ada juga program magang dan kerjasama dengan berbagai perusahaan yang memungkinkan mahasiswa mendapatkan pengalaman kerja nyata sebelum lulus. Program-program seperti ini sangat membantu dalam mempersiapkan diri memasuki dunia kerja.
              </p>
            </section>
            
            <section 
              id="tantangan"
              ref={el => sectionRefs.current.tantangan = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Tentu saja, perjalanan kuliah di Gunadarma tidak selalu mulus. Ada banyak tantangan dan hambatan yang harus dihadapi. Salah satu yang paling berat adalah masalah transportasi. Dengan kampus yang tersebar di beberapa lokasi, kadang aku harus berpindah-pindah tempat dalam satu hari. Belum lagi kemacetan Jakarta yang legendaris, membuat perjalanan antar kampus bisa memakan waktu berjam-jam. Ini menjadi tantangan tersendiri dalam manajemen waktu.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Tantangan lainnya adalah beban akademik yang kadang terasa berat. Ada kalanya dalam satu minggu, aku harus menyelesaikan beberapa tugas besar sekaligus, plus persiapan ujian. Masa-masa seperti ini benar-benar menguji mental dan fisik. Tapi justru dari situ aku belajar bagaimana mengelola stres, memprioritaskan tugas, dan tetap menjaga kesehatan meskipun dikejar deadline.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Adaptasi dengan sistem pembelajaran juga menjadi tantangan tersendiri, terutama di awal-awal kuliah. Metode pembelajaran di kampus sangat berbeda dengan di SMA. Di sini, mahasiswa dituntut untuk lebih mandiri dan proaktif dalam mencari sumber belajar. Tidak semua materi diberikan secara detail oleh dosen, ada kalanya kami harus mencari sendiri referensi tambahan. Butuh waktu untuk bisa beradaptasi dengan sistem ini, tapi setelah terbiasa, justru menjadi kebiasaan baik yang berguna hingga sekarang.
              </p>
            </section>
            
            <section 
              id="kesan"
              ref={el => sectionRefs.current.kesan = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Secara keseluruhan, aku merasa sangat bersyukur bisa kuliah di Universitas Gunadarma. Pengalaman yang kudapatkan, baik dari sisi akademik maupun non-akademik, telah membentuk diriku menjadi pribadi yang lebih baik. Aku tidak hanya mendapatkan ilmu pengetahuan, tetapi juga keterampilan hidup, relasi yang berharga, dan kenangan indah yang akan selalu kukenang.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Bagi adik-adik yang saat ini sedang mempertimbangkan untuk kuliah di Gunadarma, pesanku: persiapkan diri dengan baik. Kuliah di sini akan menantang, tapi juga akan sangat rewarding. Jangan hanya fokus pada nilai akademik, tapi juga aktiflah dalam organisasi dan kegiatan kemahasiswaan. Bangun relasi seluas mungkin, karena mereka akan menjadi teman seperjuangan sekaligus jaringan profesional di masa depan.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Jangan takut untuk bertanya dan meminta bantuan jika mengalami kesulitan. Dosen dan teman-teman di sini umumnya sangat supportive dan siap membantu. Manfaatkan juga fasilitas kampus sebaik mungkin. Laboratorium, perpustakaan, dan berbagai sumber daya lainnya ada untuk menunjang pembelajaranmu. Dan yang terpenting, nikmati setiap prosesnya. Masa kuliah adalah masa-masa yang tidak akan terulang, jadi isilah dengan hal-hal positif dan berkesan.
              </p>
            </section>
            
            <section 
              id="penutup"
              ref={el => sectionRefs.current.penutup = el}
              style={{ scrollMarginTop: '160px', marginBottom: '3em' }}
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
                Demikianlah cerita tentang pengalamanku kuliah di Universitas Gunadarma. Tentu setiap orang akan memiliki pengalaman yang berbeda, tapi setidaknya tulisan ini bisa memberikan gambaran tentang bagaimana rasanya menjadi mahasiswa di kampus yang terkenal dengan julukan "Kampus Biru" ini. Terima kasih sudah membaca, semoga bermanfaat.
              </p>
              <p style={{ marginBottom: '1.5em' }}>
                Bagi teman-teman yang juga alumni atau mahasiswa Gunadarma, jangan ragu untuk berbagi cerita di kolom komentar. Aku sangat tertarik untuk mendengar perspektif kalian. Siapa tahu dari diskusi ini, kita bisa mendapatkan wawasan baru tentang kampus tercinta ini. Sampai jumpa di artikel selanjutnya!
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
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random&color=fff`}
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
                        background: commentLoading || !newComment.trim() ? '#333333' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '30px',
                        color: commentLoading || !newComment.trim() ? '#999999' : 'white',
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
                        src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userEmail}&background=random&color=fff`}
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
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random&color=fff`}
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
                                  background: replyText.trim() ? 'rgba(255,255,255,0.1)' : '#333333',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '20px',
                                  color: replyText.trim() ? 'white' : '#999999',
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
                              src={reply.userPhoto || `https://ui-avatars.com/api/?name=${reply.userName}&background=random&color=fff`}
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

      {/* Tambahkan CSS untuk animasi notifikasi */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
