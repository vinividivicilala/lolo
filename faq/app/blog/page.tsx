'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("pendahuluan");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // State untuk Like/Unlike
  const [likes, setLikes] = useState(128);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // State untuk Comments
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Ahmad Fauzi",
      avatar: "AF",
      comment: "Terima kasih tulisannya sangat menginspirasi! Saya juga alumni Gunadarma 2020.",
      timestamp: "2 jam yang lalu",
      likes: 12
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      avatar: "SN",
      comment: "Setuju banget sama tulisannya. Gunadarma emang kampus yang penuh kenangan 🎓",
      timestamp: "5 jam yang lalu",
      likes: 8
    },
    {
      id: 3,
      name: "Budi Santoso",
      avatar: "BS",
      comment: "Baru mau masuk Gunadarma tahun ini, makin semangat bacanya!",
      timestamp: "1 hari yang lalu",
      likes: 24
    }
  ]);
  const [newComment, setNewComment] = useState("");
  const [commentName, setCommentName] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  // Format tanggal sekarang
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Handle Like
  const handleLike = () => {
    setIsAnimating(true);
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Handle Comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "" || commentName.trim() === "") return;

    const initials = commentName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newCommentObj = {
      id: comments.length + 1,
      name: commentName,
      avatar: initials,
      comment: newComment,
      timestamp: "Baru saja",
      likes: 0
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
    setCommentName("");
    setShowCommentForm(false);
  };

  // Handle Like Comment
  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 } 
        : comment
    ));
  };

  // SVG Arrow Component - SOUTH WEST ARROW
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

  // Icon Calendar
  const CalendarIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="white"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="white"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="white"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="white"/>
    </svg>
  );

  // Icon Clock
  const ClockIcon = ({ width, height }: { width: number, height: number }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
      <circle cx="12" cy="12" r="10" stroke="white"/>
      <polyline points="12 6 12 12 16 14" stroke="white"/>
    </svg>
  );

  // Rangkuman sections
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

  if (!isMounted) {
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
      
      {/* Halaman Utama - Pojok Kanan Atas */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '20px' : '40px',
        right: isMobile ? '20px' : '40px',
        zIndex: 100,
      }}>
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

      {/* Layout 2 Kolom */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '60px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '80px 0 40px' : '100px 0 60px',
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
            
            {/* ... (section lainnya tetap sama) ... */}
            
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

          {/* ===== REACT EMOTICON, LIKE/UNLIKE, DAN COMMENT ===== */}
          
          {/* Divider */}
          <div style={{
            marginTop: '60px',
            marginBottom: '40px',
            borderTop: '1px solid #333333',
          }} />
          
          {/* LIKE SECTION - DENGAN ANIMASI MOTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '40px',
              padding: '20px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}>
              {/* Like Button dengan Animasi */}
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                animate={isAnimating ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.5 }
                } : {}}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: isLiked ? 'rgba(255,100,100,0.2)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '30px',
                  transition: 'background-color 0.3s ease',
                }}
              >
                <motion.span
                  animate={isAnimating ? {
                    scale: [1, 1.5, 1],
                  } : {}}
                  style={{
                    fontSize: '1.8rem',
                  }}
                >
                  {isLiked ? '❤️' : '🤍'}
                </motion.span>
                <span style={{
                  color: 'white',
                  fontSize: '1.1rem',
                }}>
                  {likes} Suka
                </span>
              </motion.button>

              {/* Emoticon Reactions */}
              <div style={{
                display: 'flex',
                gap: '10px',
              }}>
                {['👍', '🔥', '🎓', '✨'].map((emoji, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: '5px',
                      opacity: 0.8,
                      transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comment Count */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#999999',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white"/>
              </svg>
              <span>{comments.length} Komentar</span>
            </motion.div>
          </motion.div>

          {/* ADD COMMENT BUTTON */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCommentForm(!showCommentForm)}
            style={{
              width: '100%',
              padding: '15px',
              background: 'none',
              border: '1px solid #333333',
              borderRadius: '8px',
              color: '#999999',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '30px',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333333';
              e.currentTarget.style.color = '#999999';
            }}
          >
            {showCommentForm ? '− Tutup form komentar' : '+ Tambahkan komentar'}
          </motion.button>

          {/* COMMENT FORM - DENGAN ANIMASI */}
          <AnimatePresence>
            {showCommentForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginBottom: '40px',
                  overflow: 'hidden',
                }}
              >
                <form onSubmit={handleSubmitComment} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  padding: '20px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                }}>
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    required
                    style={{
                      padding: '12px 15px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  <textarea
                    placeholder="Tulis komentar Anda..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    rows={4}
                    style={{
                      padding: '12px 15px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                  }}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '10px 25px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'black',
                        cursor: 'pointer',
                        fontWeight: 'normal',
                      }}
                    >
                      Kirim
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* COMMENTS LIST - DENGAN ANIMASI */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  style={{
                    display: 'flex',
                    gap: '15px',
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {/* Avatar dengan Animasi */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {comment.avatar}
                  </motion.div>
                  
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
                          {comment.name}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          color: '#666666',
                        }}>
                          {comment.timestamp}
                        </span>
                      </div>
                      
                      {/* Like Button untuk Comment */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLikeComment(comment.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'none',
                          border: 'none',
                          color: '#999999',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span>❤️</span>
                        <span>{comment.likes}</span>
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
                        gap: '5px',
                        background: 'none',
                        border: 'none',
                        color: '#666666',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: '5px 0',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white"/>
                      </svg>
                      <span>Balas</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
}
