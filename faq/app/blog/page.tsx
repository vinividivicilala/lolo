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

// Konten Blog untuk Ringkasan
const BLOG_CONTENT = {
  pendahuluan: "Masuk ke Universitas Gunadarma adalah salah satu keputusan terbesar dalam hidup saya. Banyak orang bertanya, 'Bagaimana rasanya?' Pertanyaan sederhana namun jawabannya sangat kompleks. Ini bukan sekadar tentang perkuliahan, tapi tentang perjalanan menemukan jati diri, bertemu dengan berbagai karakter manusia, dan belajar bahwa kehidupan tidak selalu hitam dan putih. Gunadarma mengajarkan saya bahwa pendidikan bukan hanya tentang nilai di atas kertas, tapi tentang bagaimana kita berpikir kritis, menyelesaikan masalah, dan beradaptasi dengan perubahan.",
  
  sejarah: "Universitas Gunadarma berdiri pada tahun 1981, berawal dari sebuah kursus komputer kecil yang kemudian berkembang menjadi salah satu perguruan tinggi swasta terkemuka di Indonesia. Reputasi Gunadarma di bidang teknologi informasi dan komputer sudah tidak diragukan lagi. Banyak alumni Gunadarma yang kini bekerja di perusahaan-perusahaan besar, baik di dalam maupun luar negeri.",
  
  suasana: "Suasana kampus Gunadarma selalu hidup. Dari pagi hingga malam, mahasiswa lalu-lalang dengan berbagai aktivitas. Ada yang buru-buru masuk kelas, ada yang nongkrong di kantin, ada juga yang asyik mengerjakan tugas di perpustakaan. Kampus ini tidak pernah tidur. Yang paling berkesan adalah ketika jam istirahat tiba. Kantin penuh sesak, antrian panjang di depan gerobak bakso, dan tawa riang mahasiswa yang melepas penat.",
  
  akademik: "Sistem akademik di Gunadarma terkenal dengan disiplinnya. Absensi sidik jari, tugas yang menumpuk, praktikum yang melelahkan, namun semua itu membentuk karakter kami menjadi pribadi yang tangguh dan bertanggung jawab. Tugas besar atau yang sering disebut 'tubesar' adalah momok yang menakutkan sekaligus momen yang mendewasakan.",
  
  dosen: "Dosen-dosen di Gunadarma memiliki latar belakang yang beragam. Ada yang galak dan disiplin, ada juga yang santai dan humoris. Tapi satu hal yang pasti, mereka semua berdedikasi untuk mentransfer ilmu kepada mahasiswanya. Mereka tidak hanya mengajar, tapi juga menginspirasi.",
  
  teman: "Harta paling berharga selama kuliah adalah teman-teman. Mereka yang menemani begadang saat deadline, yang meminjamkan catatan ketika kita absen, yang menghibur ketika nilai jelek, dan yang merayakan setiap pencapaian kecil. Dari sekadar teman sekelas, menjadi sahabat, bahkan keluarga.",
  
  fasilitas: "Gunadarma memiliki fasilitas yang lengkap. Laboratorium komputer dengan spesifikasi tinggi, perpustakaan dengan koleksi buku yang up-to-date, ruang kelas ber-AC, akses WiFi cepat, dan area parkir yang luas. Semua mendukung proses belajar mengajar.",
  
  organisasi: "Selain akademik, Gunadarma juga aktif dalam berbagai organisasi dan kegiatan ekstrakurikuler. Ada BEM, himpunan mahasiswa, UKM olahraga, seni, robotik, dan masih banyak lagi. Mahasiswa diberi kebebasan untuk mengembangkan minat dan bakat.",
  
  tantangan: "Tidak selalu mulus. Ada kalanya saya merasa lelah, stres, bahkan ingin menyerah. Tugas yang menumpuk, praktikum yang gagal, nilai yang tidak memuaskan, semua itu adalah bagian dari proses pendewasaan. Tantangan terbesar adalah membagi waktu antara kuliah, organisasi, dan kehidupan pribadi.",
  
  kesan: "Universitas Gunadarma bukan sekadar tempat saya mengejar gelar sarjana. Ini adalah rumah kedua yang membentuk saya menjadi pribadi yang lebih baik. Di sini saya belajar bahwa kesuksesan bukan tentang seberapa cepat kita lulus, tapi seberapa banyak ilmu dan pengalaman yang kita dapatkan.",
  
  penutup: "Kuliah di Gunadarma adalah perjalanan yang penuh warna. Setiap suka dan duka, setiap tawa dan tangis, setiap keberhasilan dan kegagalan, semuanya membentuk saya menjadi pribadi yang lebih kuat dan siap menghadapi dunia. Terima kasih Gunadarma, terima kasih para dosen, dan terima kasih teman-teman."
};

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

  // State untuk Chatbot
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [summaryLevel, setSummaryLevel] = useState<"singkat" | "sedang" | "detail">("sedang");

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
  // 13. HANDLE REACTION (EMOTICON)
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
  // 14. HANDLE GOOGLE LOGIN
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
  // 15. HANDLE LOGOUT
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
  // 16. HANDLE ADD COMMENT
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
  // 17. HANDLE ADD REPLY
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
  // 18. HANDLE LIKE COMMENT
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
  // 19. HANDLE SAVE
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
  // 20. HANDLE SHARE
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
  // 21. CHATBOT FUNCTIONS
  // ============================================
  const generateSummary = (sectionId: string, level: "singkat" | "sedang" | "detail"): string => {
    const content = BLOG_CONTENT[sectionId as keyof typeof BLOG_CONTENT] || "";
    
    if (!content) return "Maaf, bagian ini tidak ditemukan.";
    
    const sentences = content.split('. ').filter(s => s.trim().length > 0);
    
    switch(level) {
      case "singkat":
        // Ambil 1-2 kalimat pertama
        return sentences.slice(0, 2).join('. ') + '.';
      
      case "sedang":
        // Ambil 3-4 kalimat atau setengah dari konten
        const midCount = Math.min(4, Math.ceil(sentences.length / 2));
        return sentences.slice(0, midCount).join('. ') + '.';
      
      case "detail":
        // Ambil 6-7 kalimat atau 3/4 dari konten
        const detailCount = Math.min(7, Math.ceil(sentences.length * 0.75));
        return sentences.slice(0, detailCount).join('. ') + '.';
      
      default:
        return sentences.slice(0, 3).join('. ') + '.';
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Tambahkan pesan user
    const userMessage = { text: chatInput, isUser: true };
    setChatMessages(prev => [...prev, userMessage]);

    // Proses input user
    const input = chatInput.toLowerCase();
    let response = "";

    if (input.includes("halo") || input.includes("hai") || input.includes("hi")) {
      response = "Halo! Ada yang bisa saya bantu? Saya bisa merangkum bagian-bagian blog ini untuk Anda.";
    }
    else if (input.includes("rangkum semua") || input.includes("semua bagian")) {
      const summaries = Object.keys(BLOG_CONTENT).map(key => {
        const title = key.charAt(0).toUpperCase() + key.slice(1);
        const summary = generateSummary(key, summaryLevel);
        return `${title}: ${summary}`;
      }).join('\n\n');
      response = `Berikut ringkasan semua bagian blog (level ${summaryLevel}):\n\n${summaries}`;
    }
    else if (input.includes("pendahuluan") || input.includes("pengantar")) {
      setSelectedSection("pendahuluan");
      response = `Ringkasan bagian Pendahuluan (level ${summaryLevel}):\n${generateSummary("pendahuluan", summaryLevel)}`;
    }
    else if (input.includes("sejarah") || input.includes("reputasi")) {
      setSelectedSection("sejarah");
      response = `Ringkasan bagian Sejarah & Reputasi (level ${summaryLevel}):\n${generateSummary("sejarah", summaryLevel)}`;
    }
    else if (input.includes("suasana")) {
      setSelectedSection("suasana");
      response = `Ringkasan bagian Suasana Kampus (level ${summaryLevel}):\n${generateSummary("suasana", summaryLevel)}`;
    }
    else if (input.includes("akademik")) {
      setSelectedSection("akademik");
      response = `Ringkasan bagian Kehidupan Akademik (level ${summaryLevel}):\n${generateSummary("akademik", summaryLevel)}`;
    }
    else if (input.includes("dosen")) {
      setSelectedSection("dosen");
      response = `Ringkasan bagian Para Dosen (level ${summaryLevel}):\n${generateSummary("dosen", summaryLevel)}`;
    }
    else if (input.includes("teman") || input.includes("pertemanan")) {
      setSelectedSection("teman");
      response = `Ringkasan bagian Pertemanan & Relasi (level ${summaryLevel}):\n${generateSummary("teman", summaryLevel)}`;
    }
    else if (input.includes("fasilitas")) {
      setSelectedSection("fasilitas");
      response = `Ringkasan bagian Fasilitas Kampus (level ${summaryLevel}):\n${generateSummary("fasilitas", summaryLevel)}`;
    }
    else if (input.includes("organisasi") || input.includes("kegiatan")) {
      setSelectedSection("organisasi");
      response = `Ringkasan bagian Organisasi & Kegiatan (level ${summaryLevel}):\n${generateSummary("organisasi", summaryLevel)}`;
    }
    else if (input.includes("tantangan") || input.includes("hambatan")) {
      setSelectedSection("tantangan");
      response = `Ringkasan bagian Tantangan & Hambatan (level ${summaryLevel}):\n${generateSummary("tantangan", summaryLevel)}`;
    }
    else if (input.includes("kesan") || input.includes("pesan")) {
      setSelectedSection("kesan");
      response = `Ringkasan bagian Kesan & Pesan (level ${summaryLevel}):\n${generateSummary("kesan", summaryLevel)}`;
    }
    else if (input.includes("penutup")) {
      setSelectedSection("penutup");
      response = `Ringkasan bagian Penutup (level ${summaryLevel}):\n${generateSummary("penutup", summaryLevel)}`;
    }
    else if (input.includes("level") || input.includes("tingkat")) {
      if (input.includes("singkat")) {
        setSummaryLevel("singkat");
        response = "Level ringkasan diubah menjadi 'Singkat' (1-2 kalimat)";
      } else if (input.includes("sedang")) {
        setSummaryLevel("sedang");
        response = "Level ringkasan diubah menjadi 'Sedang' (3-4 kalimat)";
      } else if (input.includes("detail")) {
        setSummaryLevel("detail");
        response = "Level ringkasan diubah menjadi 'Detail' (6-7 kalimat)";
      } else {
        response = `Level ringkasan saat ini: ${summaryLevel}. Anda bisa mengubahnya dengan mengetik 'level singkat', 'level sedang', atau 'level detail'`;
      }
    }
    else if (input.includes("bantuan") || input.includes("help")) {
      response = `Berikut perintah yang bisa Anda gunakan:
- Halo / Hai : Menyapa chatbot
- Rangkum semua : Merangkum semua bagian blog
- [Nama bagian] : Merangkum bagian tertentu (contoh: pendahuluan, sejarah, suasana, akademik, dosen, teman, fasilitas, organisasi, tantangan, kesan, penutup)
- Level [singkat/sedang/detail] : Mengubah tingkat detail ringkasan
- Bantuan : Menampilkan menu bantuan ini`;
    }
    else {
      response = `Maaf, saya tidak memahami pertanyaan Anda. Ketik "bantuan" untuk melihat perintah yang tersedia.`;
    }

    // Tambahkan respons chatbot dengan delay untuk efek natural
    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 500);

    setChatInput("");
  };

  const clearChat = () => {
    setChatMessages([]);
    setSelectedSection(null);
  };

  // ============================================
  // 22. SCROLL HANDLER
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
  // 23. SVG COMPONENTS
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

  const SaveIcon = ({ width, height, filled }: { width: number, height: number, filled?: boolean }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const HistoryIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const ChatIcon = ({ width, height }: { width: number, height: number }) => (
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

  const ClearIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  // Twitter Icon
  const TwitterIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  // ============================================
  // 24. RANGKUMAN SECTIONS
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
    bio: "Manusia Biasa"
  };

  // ============================================
  // 25. LOADING STATE
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
        {/* Chatbot Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowChatbot(!showChatbot)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: showChatbot ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: showChatbot ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '40px',
            padding: '10px 24px',
            color: 'white',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <ChatIcon width={20} height={20} />
          <span>Ringkas Blog</span>
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
            border: isSaved ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '40px',
            padding: '10px 24px',
            color: 'white',
            fontSize: '0.95rem',
            cursor: user ? 'pointer' : 'pointer',
          }}
        >
          <SaveIcon width={20} height={20} filled={isSaved} />
          <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
          <motion.span
            key={saveCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              color: 'white',
            }}
          >
            {saveCount}
          </motion.span>
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
          <motion.span
            key={shareCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              color: 'white',
            }}
          >
            {shareCount}
          </motion.span>
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

      {/* CHATBOT MODAL */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: isMobile ? '70px' : '80px',
              right: isMobile ? '20px' : '40px',
              width: isMobile ? 'calc(100% - 40px)' : '350px',
              height: '500px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '24px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            {/* Chatbot Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #333333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  color: 'white',
                  margin: '0 0 4px 0',
                }}>
                  Asisten Ringkasan Blog
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#999999',
                  margin: 0,
                }}>
                  Level: {summaryLevel} • {selectedSection ? `Bagian: ${selectedSection}` : 'Pilih bagian'}
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
              }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clearChat}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999999',
                    cursor: 'pointer',
                    padding: '5px',
                  }}
                >
                  <ClearIcon width={18} height={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowChatbot(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999999',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ×
                </motion.button>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}>
              {chatMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    color: '#666666',
                    padding: '30px 20px',
                  }}
                >
                  <ChatIcon width={40} height={40} />
                  <p style={{ marginTop: '15px', fontSize: '0.95rem' }}>
                    Halo! Saya bisa membantu merangkum blog ini. 
                    Ketik "bantuan" untuk melihat perintah yang tersedia.
                  </p>
                </motion.div>
              ) : (
                chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                    }}
                  >
                    <div style={{
                      padding: '12px 16px',
                      background: msg.isUser ? '#FF6B00' : '#2a2a2a',
                      borderRadius: msg.isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                      color: msg.isUser ? 'white' : '#e0e0e0',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} style={{
              padding: '20px',
              borderTop: '1px solid #333333',
              display: 'flex',
              gap: '10px',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Tulis pertanyaan Anda..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#2a2a2a',
                  border: '1px solid #444444',
                  borderRadius: '30px',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!chatInput.trim()}
                style={{
                  padding: '12px',
                  background: chatInput.trim() ? '#FF6B00' : '#333333',
                  border: 'none',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <SendIcon width={20} height={20} />
              </motion.button>
            </form>
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
                    background: '#1DA1F2',
                    border: 'none',
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
                <motion.img 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
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
                  <motion.span
                    whileHover={{ x: 5 }}
                    style={{
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '500',
                      display: 'block',
                      cursor: 'pointer',
                    }}
                  >
                    Farid Ardiansyah
                  </motion.span>
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
                        width: '200px',
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
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '4px',
                          }}>
                            Farid Ardiansyah
                          </span>
                          <span style={{
                            color: '#FF6B00',
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
                          margin: 0,
                          fontStyle: 'italic',
                        }}
                      >
                        "{authorBio.bio}"
                      </motion.p>
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
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                whileHover={{ x: 10, color: '#ffffff' }}
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
