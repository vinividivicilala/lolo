'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";

// Data blog posts dengan tags
const BLOG_POSTS = [
  {
    id: 'gunadarma-article',
    title: 'Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma',
    slug: 'gunadarma',
    excerpt: 'Pengalaman pribadi menjalani perkuliahan di Universitas Gunadarma, dari akademik hingga organisasi.',
    tags: ['kuliah', 'gunadarma'],
    date: '2024-01-15',
    readTime: 8,
    isNew: true // Menandai artikel baru
  },
  {
    id: 'memilih-jurusan',
    title: 'Mengapa saya memilih jurusan tersebut',
    slug: 'memilih-jurusan',
    excerpt: 'Alasan di balik keputusan memilih program studi yang tepat.',
    tags: ['jurusan', 'kuliah', 'karir'],
    date: '2024-01-10',
    readTime: 5,
    isNew: true // Menandai artikel baru
  },
  {
    id: 'tips-belajar-coding',
    title: 'Tips Belajar Coding untuk Pemula',
    slug: 'tips-belajar-coding',
    excerpt: 'Panduan praktis memulai perjalanan sebagai programmer.',
    tags: ['it', 'kuliah', 'karir'],
    date: '2024-01-05',
    readTime: 6,
    isNew: false
  },
  {
    id: 'prospek-karir-it',
    title: 'Prospek Karir di Bidang IT',
    slug: 'prospek-karir-it',
    excerpt: 'Peluang kerja dan perkembangan karir di industri teknologi.',
    tags: ['it', 'karir'],
    date: '2023-12-28',
    readTime: 7,
    isNew: false
  },
  {
    id: 'tips-memilih-jurusan',
    title: 'Tips Memilih Jurusan Kuliah',
    slug: 'tips-memilih-jurusan',
    excerpt: 'Panduan lengkap memilih jurusan yang tepat untuk masa depan.',
    tags: ['jurusan', 'kuliah'],
    date: '2023-12-20',
    readTime: 6,
    isNew: false
  },
  {
    id: 'pengalaman-magang',
    title: 'Pengalaman Magang di Perusahaan Teknologi',
    slug: 'pengalaman-magang',
    excerpt: 'Cerita magang dan persiapan memasuki dunia kerja.',
    tags: ['it', 'karir', 'kuliah'],
    date: '2023-12-15',
    readTime: 5,
    isNew: false
  }
];

// Data tag dan deskripsinya
const TAG_INFO: { [key: string]: { name: string, description: string } } = {
  kuliah: {
    name: 'Kuliah',
    description: 'Kumpulan artikel tentang pengalaman, tips, dan cerita seputar perkuliahan.'
  },
  gunadarma: {
    name: 'Gunadarma',
    description: 'Artikel-artikel yang membahas tentang Universitas Gunadarma, dari sejarah hingga kehidupan kampus.'
  },
  jurusan: {
    name: 'Jurusan',
    description: 'Informasi dan tips seputar pemilihan jurusan kuliah yang tepat.'
  },
  it: {
    name: 'IT',
    description: 'Artikel tentang dunia teknologi informasi, programming, dan perkembangan digital.'
  },
  karir: {
    name: 'Karir',
    description: 'Tips dan informasi seputar persiapan karir dan dunia kerja.'
  }
};

// Icons
const CalendarIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor"/>
  </svg>
);

const ClockIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="12" cy="12" r="10" stroke="currentColor"/>
    <polyline points="12 6 12 12 16 14" stroke="currentColor"/>
  </svg>
);

const TagIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

// North West Arrow SVG
const NorthWestArrow = ({ width, height }: { width: number | string, height: number | string }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 17L7 7" stroke="white"/>
    <path d="M17 7H7" stroke="white"/>
    <path d="M7 7V17" stroke="white"/>
  </svg>
);

// North East Arrow SVG (untuk setiap blog)
const NorthEastArrow = ({ width, height }: { width: number | string, height: number | string }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 7L17 17" stroke="white"/>
    <path d="M7 7H17" stroke="white"/>
    <path d="M7 17V7" stroke="white"/>
  </svg>
);

// Komponen Titik Berkedip (Radar/LED)
const BlinkingDot = () => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dotRef.current) {
      // Animasi titik berkedip dengan efek radar/pemancar
      gsap.to(dotRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: "power1.inOut"
      });

      // Animasi titik inti
      gsap.to(dotRef.current, {
        boxShadow: '0 0 20px #ef4444',
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: 16, height: 16 }}>
      {/* Lingkaran efek radar */}
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          opacity: 0.7,
        }}
      />
      {/* Titik inti */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          boxShadow: '0 0 10px #ef4444',
        }}
      />
    </div>
  );
};

export default function TagPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = params.tagId as string;
  
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs untuk GSAP animations
  const bannerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const emoji1Ref = useRef<HTMLDivElement>(null);
  const emoji2Ref = useRef<HTMLDivElement>(null);

  // Filter posts berdasarkan tag
  const filteredPosts = BLOG_POSTS.filter(post => post.tags.includes(tagId));
  const currentTag = TAG_INFO[tagId] || { name: tagId, description: '' };
  const otherTags = Object.keys(TAG_INFO).filter(t => t !== tagId);

  // GSAP Animations
  useEffect(() => {
    if (!isMounted) return;

    // Banner animation
    if (bannerRef.current) {
      gsap.fromTo(bannerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    // Emoji animations
    if (emoji1Ref.current && emoji2Ref.current) {
      // Create timeline for emojis
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      
      tl.to([emoji1Ref.current, emoji2Ref.current], {
        rotation: 10,
        duration: 0.2,
        ease: "power1.inOut"
      })
      .to([emoji1Ref.current, emoji2Ref.current], {
        rotation: -10,
        duration: 0.3,
        ease: "power1.inOut"
      })
      .to([emoji1Ref.current, emoji2Ref.current], {
        rotation: 10,
        duration: 0.2,
        ease: "power1.inOut"
      })
      .to([emoji1Ref.current, emoji2Ref.current], {
        rotation: 0,
        duration: 0.3,
        ease: "power1.inOut"
      });
    }

    // Header animation
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power2.out" }
      );
    }

  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  if (!TAG_INFO[tagId]) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '20px' }}>404</h1>
        <p style={{ color: '#999999', fontSize: '1.2rem', marginBottom: '30px' }}>
          Tag tidak ditemukan
        </p>
        <button
          onClick={() => router.push('/blog')}
          style={{
            padding: '12px 32px',
            background: 'white',
            border: 'none',
            borderRadius: '30px',
            color: 'black',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Kembali ke Blog
        </button>
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
      
      {/* ===== BANNER DEVELOPMENT dengan GSAP ===== */}
      <div
        ref={bannerRef}
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
          boxShadow: '0 4px 20px rgba(255,107,0,0.3)',
        }}
      >
        <div
          ref={emoji1Ref}
          style={{
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            display: 'flex',
            alignItems: 'center',
            transform: 'rotate(0deg)',
          }}
        >
          🚧
        </div>
        <span style={{
          fontSize: isMobile ? '0.9rem' : '1.1rem',
          fontWeight: '500',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.2)',
          padding: '4px 16px',
          borderRadius: '30px',
        }}>
          Halaman ini sedang dalam pengembangan, judul blog tidak 100% benar
        </span>
        <div
          ref={emoji2Ref}
          style={{
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            display: 'flex',
            alignItems: 'center',
            transform: 'rotate(0deg)',
          }}
        >
          🚧
        </div>
      </div>

      {/* Header dengan North West Arrow + Halaman Utama */}
      <div
        ref={headerRef}
        style={{
          position: 'fixed',
          top: isMobile ? '70px' : '80px',
          right: isMobile ? '20px' : '40px',
          zIndex: 100,
        }}
      >
        <Link 
          href="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            textDecoration: 'none',
            color: 'white',
            padding: '10px 20px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '40px',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <NorthWestArrow 
            width={isMobile ? 24 : 28} 
            height={isMobile ? 24 : 28} 
          />
          <span style={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: '500',
          }}>
            Halaman Utama
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: isMobile ? '140px 0 40px' : '160px 0 60px',
      }}>
        
        {/* Tag Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            marginBottom: '50px',
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 24px',
            backgroundColor: '#222222',
            border: '1px solid #444444',
            borderRadius: '40px',
            marginBottom: '20px',
          }}>
            <TagIcon width={20} height={20} />
            <span style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              color: 'white',
            }}>
              #{currentTag.name}
            </span>
          </div>
          
          <p style={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            color: '#999999',
            maxWidth: '600px',
            lineHeight: '1.6',
          }}>
            {currentTag.description}
          </p>
          
          <div style={{
            marginTop: '15px',
            color: '#666666',
            fontSize: '1rem',
          }}>
            {filteredPosts.length} artikel tersedia
          </div>
        </motion.div>

        {/* Articles List */}
        {filteredPosts.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
          }}>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link 
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '30px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    {/* New Indicator untuk 2 judul blog pertama */}
                    {index < 2 && (
                      <>
                        {/* Titik Berkedip */}
                        <div style={{
                          position: 'absolute',
                          top: '30px',
                          left: '-8px',
                          zIndex: 10,
                        }}>
                          <BlinkingDot />
                        </div>
                        
                        {/* Blok Warna Stabilo "NEW" */}
                        <div style={{
                          position: 'absolute',
                          top: '20px',
                          left: '20px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          boxShadow: '0 2px 10px rgba(239,68,68,0.5)',
                          zIndex: 5,
                        }}>
                          NEW
                        </div>
                      </>
                    )}

                    {/* Konten Artikel */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px',
                    }}>
                      <div style={{
                        flex: 1,
                      }}>
                        <h2 style={{
                          fontSize: isMobile ? '1.6rem' : '2rem',
                          fontWeight: 'normal',
                          color: 'white',
                          margin: index < 2 ? '30px 0 15px 0' : '0 0 15px 0',
                        }}>
                          {post.title}
                        </h2>
                        
                        <p style={{
                          fontSize: isMobile ? '1rem' : '1.1rem',
                          color: '#999999',
                          marginBottom: '20px',
                          lineHeight: '1.6',
                        }}>
                          {post.excerpt}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '10px',
                          marginBottom: '20px',
                        }}>
                          {post.tags.map(tag => (
                            <span
                              key={tag}
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(`/tag/${tag}`);
                              }}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#222222',
                                border: '1px solid #444444',
                                borderRadius: '20px',
                                color: '#cccccc',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#333333';
                                e.currentTarget.style.borderColor = '#666666';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#222222';
                                e.currentTarget.style.borderColor = '#444444';
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          color: '#666666',
                          fontSize: '0.9rem',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}>
                            <CalendarIcon width={16} height={16} />
                            <span>{new Date(post.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}>
                            <ClockIcon width={16} height={16} />
                            <span>{post.readTime} menit membaca</span>
                          </div>
                        </div>
                      </div>

                      {/* Tanda Panah SVG untuk setiap blog */}
                      <motion.div
                        whileHover={{ x: 5, y: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: isMobile ? 40 : 50,
                        }}
                      >
                        <NorthEastArrow 
                          width={isMobile ? 40 : 50} 
                          height={isMobile ? 40 : 50} 
                        />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
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
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>🏷️</span>
            <p style={{ fontSize: '1.2rem', margin: 0 }}>Belum ada artikel dengan tag ini.</p>
          </motion.div>
        )}

        {/* Other Tags */}
        {otherTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: '80px',
              paddingTop: '40px',
              borderTop: '1px solid #333333',
            }}
          >
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 'normal',
              color: 'white',
              marginBottom: '20px',
            }}>
              Tags Lainnya
            </h3>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {otherTags.map((otherTag) => (
                <Link
                  key={otherTag}
                  href={`/tag/${otherTag}`}
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
                    }}
                  >
                    #{TAG_INFO[otherTag].name}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
