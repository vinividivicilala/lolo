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
  limit,
  Timestamp,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  where,
  addDoc,
  onSnapshot
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

  // State untuk Like
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  // State untuk Comments
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeCommentId, setLikeCommentId] = useState<string | null>(null);

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
    
    // Initialize Firebase
    try {
      const app = getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApps()[0];
      
      const auth = getAuth(app);
      const db = getFirestore(app);
      
      setFirebaseAuth(auth);
      setFirebaseDb(db);
      setFirebaseInitialized(true);
      
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // ============================================
  // 2. AUTH STATE LISTENER
  // ============================================
  useEffect(() => {
    if (!firebaseAuth || !firebaseInitialized) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      setLoading(false);
      console.log("Auth state changed:", currentUser?.email);
    });

    return () => unsubscribe();
  }, [firebaseAuth, firebaseInitialized]);

  // ============================================
  // 3. LOAD LIKE DATA FROM FIREBASE
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const loadLikeData = async () => {
      try {
        // Get total likes
        const likesDoc = doc(firebaseDb, "blogStats", "gunadarma-article");
        const likesSnapshot = await getDoc(likesDoc);
        
        if (likesSnapshot.exists()) {
          setLikes(likesSnapshot.data().totalLikes || 0);
        } else {
          // Create document if not exists
          await setDoc(likesDoc, { totalLikes: 0, likedBy: [] });
        }

        // Check if user liked
        if (user) {
          const userLikeDoc = doc(firebaseDb, "userLikes", `${user.uid}_gunadarma-article`);
          const userLikeSnapshot = await getDoc(userLikeDoc);
          setIsLiked(userLikeSnapshot.exists());
        }
      } catch (error) {
        console.error("Error loading likes:", error);
      }
    };

    loadLikeData();
  }, [firebaseDb, firebaseInitialized, user]);

  // ============================================
  // 4. LOAD COMMENTS FROM FIREBASE (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const commentsRef = collection(firebaseDb, "blogComments");
    const q = query(commentsRef, where("articleId", "==", "gunadarma-article"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized]);

  // ============================================
  // 5. SCROLL HANDLER FOR ACTIVE SECTION
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
  // 6. HANDLE LIKE/UNLIKE (REAL)
  // ============================================
  const handleLike = async () => {
    if (!user) {
      // Jika belum login, trigger login Google
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb) return;

    setLikeAnimating(true);
    
    try {
      const likesDoc = doc(firebaseDb, "blogStats", "gunadarma-article");
      const userLikeDoc = doc(firebaseDb, "userLikes", `${user.uid}_gunadarma-article`);

      if (isLiked) {
        // Unlike
        await updateDoc(likesDoc, {
          totalLikes: likes - 1,
          likedBy: arrayRemove(user.uid)
        });
        await deleteDoc(userLikeDoc);
        setIsLiked(false);
        setLikes(likes - 1);
      } else {
        // Like
        await updateDoc(likesDoc, {
          totalLikes: likes + 1,
          likedBy: arrayUnion(user.uid)
        });
        await setDoc(userLikeDoc, {
          userId: user.uid,
          articleId: "gunadarma-article",
          likedAt: Timestamp.now()
        });
        setIsLiked(true);
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }

    setTimeout(() => setLikeAnimating(false), 500);
  };

  // ============================================
  // 7. HANDLE GOOGLE LOGIN
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
  // 8. HANDLE LOGOUT
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
  // 9. HANDLE ADD COMMENT (REAL)
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
        createdAt: Timestamp.now(),
        replies: []
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
  // 10. HANDLE LIKE COMMENT (REAL)
  // ============================================
  const handleLikeComment = async (commentId: string, currentLikes: number, likedBy: string[] = []) => {
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb) return;

    setLikeCommentId(commentId);
    
    try {
      const commentRef = doc(firebaseDb, "blogComments", commentId);
      
      if (likedBy.includes(user.uid)) {
        // Unlike comment
        await updateDoc(commentRef, {
          likes: currentLikes - 1,
          likedBy: arrayRemove(user.uid)
        });
      } else {
        // Like comment
        await updateDoc(commentRef, {
          likes: currentLikes + 1,
          likedBy: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setTimeout(() => setLikeCommentId(null), 300);
    }
  };

  // ============================================
  // 11. SVG COMPONENTS
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
  // 12. RANGKUMAN SECTIONS
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
  // 13. LOADING STATE
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '8px 16px',
            borderRadius: '30px',
          }}>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
              alt={user.displayName}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <span style={{
              fontSize: '0.9rem',
              color: 'white',
            }}>
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '4px 12px',
                color: '#999999',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '30px',
              padding: '8px 20px',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Login dengan Google</span>
          </button>
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
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
              lineHeight: '0.9',
              letterSpacing: '-2px',
            }}>
              Blog
            </h1>
            
            {/* Tanggal dan Waktu Baca */}
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
          
          {/* Rangkuman Title */}
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
          
          {/* Daftar Rangkuman */}
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
          
          {/* Judul Artikel */}
          <h2 style={{
            fontSize: isMobile ? '2rem' : '2.8rem',
            fontWeight: 'normal',
            color: 'white',
            marginBottom: '40px',
            lineHeight: '1.2',
          }}>
            Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma
          </h2>

          {/* Konten Artikel */}
          <div style={{
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            lineHeight: '1.8',
            color: '#e0e0e0',
          }}>
            
            <section 
              id="pendahuluan"
              ref={el => sectionRefs.current.pendahuluan = el}
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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
              style={{ scrollMarginTop: '100px', marginBottom: '3em' }}
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

          {/* ===== LIKE SECTION - REAL TIME ===== */}
          <div style={{
            marginTop: '60px',
            marginBottom: '40px',
            borderTop: '1px solid #333333',
            paddingTop: '40px',
          }}>
            
            {/* Like Button */}
            <motion.button
              onClick={handleLike}
              whileTap={{ scale: 0.9 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'none',
                border: isLiked ? '1px solid #ff4444' : '1px solid #333333',
                borderRadius: '30px',
                padding: '12px 24px',
                cursor: 'pointer',
                backgroundColor: isLiked ? 'rgba(255,68,68,0.1)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <motion.div
                animate={likeAnimating ? {
                  scale: [1, 1.5, 1],
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.5 }
                } : {}}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill={isLiked ? "#ff4444" : "none"} 
                  stroke={isLiked ? "#ff4444" : "white"} 
                  strokeWidth="1"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </motion.div>
              <span style={{
                color: 'white',
                fontSize: '1.1rem',
              }}>
                {likes} {isLiked ? 'Disukai' : 'Suka'}
              </span>
            </motion.button>

            {/* Emoticon Reactions - Modern */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginTop: '20px',
            }}>
              {[
                { emoji: '👍', label: 'Setuju', count: 45 },
                { emoji: '🔥', label: 'Hebat', count: 32 },
                { emoji: '🎓', label: 'Inspiratif', count: 28 },
                { emoji: '✨', label: 'Keren', count: 21 },
              ].map((reaction, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'none',
                    border: '1px solid #333333',
                    borderRadius: '12px',
                    padding: '10px 15px',
                    cursor: 'pointer',
                    minWidth: '70px',
                  }}
                  onClick={() => {
                    if (!user) handleGoogleLogin();
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{reaction.emoji}</span>
                  <span style={{ fontSize: '0.8rem', color: '#999999' }}>{reaction.count}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ===== COMMENT SECTION - REAL TIME ===== */}

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
              padding: '16px',
              background: 'none',
              border: '1px dashed #444444',
              borderRadius: '8px',
              color: user ? '#999999' : 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '30px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {user ? 'Tulis komentar...' : 'Login untuk menulis komentar'}
          </motion.button>

          {/* Comment Form */}
          <AnimatePresence>
            {showCommentForm && user && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: '30px' }}
              >
                <form onSubmit={handleAddComment} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '5px',
                  }}>
                    <img 
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}`}
                      alt={user?.displayName}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <span style={{ color: 'white', fontSize: '0.95rem' }}>
                      {user?.displayName || user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tulis komentar Anda..."
                    rows={4}
                    required
                    style={{
                      padding: '15px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333333',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowCommentForm(false)}
                      style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: '1px solid #333333',
                        borderRadius: '6px',
                        color: '#999999',
                        cursor: 'pointer',
                      }}
                    >
                      Batal
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={commentLoading || !newComment.trim()}
                      style={{
                        padding: '10px 24px',
                        background: commentLoading || !newComment.trim() ? '#333333' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        color: commentLoading || !newComment.trim() ? '#999999' : 'black',
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

          {/* Comments List - Real Time */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: 'normal',
              color: 'white',
              marginBottom: '10px',
            }}>
              {comments.length} Komentar
            </h4>

            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={{
                    display: 'flex',
                    gap: '15px',
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                  }}
                >
                  {/* Avatar */}
                  <img 
                    src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userEmail}`}
                    alt={comment.userName}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  
                  {/* Comment Content */}
                  <div style={{
                    flex: '1',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}>
                        <span style={{
                          fontSize: '1rem',
                          color: 'white',
                        }}>
                          {comment.userName}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          color: '#666666',
                        }}>
                          {comment.createdAt?.toLocaleDateString?.('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) || 'Baru saja'}
                        </span>
                      </div>
                      
                      {/* Like Comment Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLikeComment(comment.id, comment.likes || 0, comment.likedBy || [])}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          color: comment.likedBy?.includes(user?.uid) ? '#ff4444' : '#999999',
                          cursor: user ? 'pointer' : 'not-allowed',
                          fontSize: '0.9rem',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          backgroundColor: comment.likedBy?.includes(user?.uid) ? 'rgba(255,68,68,0.1)' : 'transparent',
                        }}
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill={comment.likedBy?.includes(user?.uid) ? "#ff4444" : "none"} 
                          stroke="currentColor" 
                          strokeWidth="1"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span>{comment.likes || 0}</span>
                      </motion.button>
                    </div>
                    
                    <p style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      color: '#e0e0e0',
                      margin: '0 0 10px 0',
                    }}>
                      {comment.comment}
                    </p>
                    
                    {/* Reply Button */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: '#666666',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: '5px 0',
                      }}
                      onClick={() => {
                        if (!user) handleGoogleLogin();
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span>Balas</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {comments.length === 0 && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666666',
                border: '1px dashed #333333',
                borderRadius: '12px',
              }}>
                Belum ada komentar. Jadilah yang pertama!
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
