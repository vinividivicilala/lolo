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
    date: '2026-02-13',
    readTime: 8,
    isComingSoon: false // Artikel ini TIDAK coming soon
  },
  {
    id: 'memilih-jurusan',
    title: 'Mengapa saya memilih jurusan tersebut',
    slug: 'memilih-jurusan',
    excerpt: 'Alasan di balik keputusan memilih program studi yang tepat.',
    tags: ['jurusan', 'kuliah', 'karir'],
    date: '2026-02-13',
    readTime: 10,
    isComingSoon: false // Artikel ini TIDAK coming soon
  },
  {
    id: 'tips-belajar-coding',
    title: 'Tips Belajar Coding untuk Pemula',
    slug: 'tips-belajar-coding',
    excerpt: 'Panduan praktis memulai perjalanan sebagai programmer.',
    tags: ['it', 'kuliah', 'karir'],
    date: '2024-01-05',
    readTime: 6,
    isComingSoon: true // Coming soon
  },
  {
    id: 'prospek-karir-it',
    title: 'Prospek Karir di Bidang IT',
    slug: 'prospek-karir-it',
    excerpt: 'Peluang kerja dan perkembangan karir di industri teknologi.',
    tags: ['it', 'karir'],
    date: '2023-12-28',
    readTime: 7,
    isComingSoon: true // Coming soon
  },
  {
    id: 'tips-memilih-jurusan',
    title: 'Tips Memilih Jurusan Kuliah',
    slug: 'tips-memilih-jurusan',
    excerpt: 'Panduan lengkap memilih jurusan yang tepat untuk masa depan.',
    tags: ['jurusan', 'kuliah'],
    date: '2023-12-20',
    readTime: 6,
    isComingSoon: true // Coming soon
  },
  {
    id: 'pengalaman-magang',
    title: 'Pengalaman Magang di Perusahaan Teknologi',
    slug: 'pengalaman-magang',
    excerpt: 'Cerita magang dan persiapan memasuki dunia kerja.',
    tags: ['it', 'karir', 'kuliah'],
    date: '2023-12-15',
    readTime: 5,
    isComingSoon: true // Coming soon
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

// Icons SVG
const CalendarIcon = ({ width = 20, height = 20 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor"/>
  </svg>
);

const ClockIcon = ({ width = 20, height = 20 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" stroke="currentColor"/>
    <polyline points="12 6 12 12 16 14" stroke="currentColor"/>
  </svg>
);

const TagIcon = ({ width = 20, height = 20 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

// North West Arrow SVG
const NorthWestArrow = ({ width = 24, height = 24 }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 17L7 7"/>
    <path d="M17 7H7"/>
    <path d="M7 7V17"/>
  </svg>
);

// North East Arrow SVG
const NorthEastArrow = ({ width = 24, height = 24 }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 7L17 17"/>
    <path d="M7 7H17"/>
    <path d="M7 17V7"/>
  </svg>
);

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

    if (bannerRef.current) {
      gsap.fromTo(bannerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    if (emoji1Ref.current && emoji2Ref.current) {
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
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ color: '#000000', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  if (!TAG_INFO[tagId]) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#000000', fontSize: '3rem', marginBottom: '20px', fontWeight: '400' }}>404</h1>
        <p style={{ color: '#666666', fontSize: '1.2rem', marginBottom: '30px' }}>
          Tag tidak ditemukan
        </p>
        <button
          onClick={() => router.push('/blog')}
          style={{
            padding: '12px 32px',
            background: '#000000',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
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
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#000000',
      position: 'relative',
      padding: isMobile ? '20px' : '40px',
    }}>
      
      {/* Banner Development */}
      <div
        ref={bannerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: '#f5f5f5',
          color: '#000000',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          borderBottom: '1px solid #e0e0e0',
          flexWrap: 'wrap',
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
          fontWeight: '400',
          textAlign: 'center',
          color: '#666666',
        }}>
          Halaman ini sedang dalam pengembangan
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

      {/* Header dengan North West Arrow */}
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
            gap: '12px',
            textDecoration: 'none',
            color: '#000000',
            padding: '8px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
            e.currentTarget.style.borderColor = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#e0e0e0';
          }}
        >
          <NorthWestArrow width={20} height={20} />
          <span style={{
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: '400',
          }}>
            Halaman Utama
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '140px 0 40px' : '160px 0 60px',
      }}>
        
        {/* Tag Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            marginBottom: '60px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '30px',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <TagIcon width={24} height={24} />
            <span style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              color: '#000000',
              fontWeight: '400',
              letterSpacing: '-0.02em',
            }}>
              #{currentTag.name}
            </span>
          </div>
          
          <p style={{
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            color: '#666666',
            maxWidth: '700px',
            lineHeight: '1.6',
            marginBottom: '12px',
            fontWeight: '300',
          }}>
            {currentTag.description}
          </p>
          
          <div style={{
            color: '#999999',
            fontSize: '1rem',
            fontWeight: '300',
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link 
                  href={post.isComingSoon ? '#' : `/blog/${post.slug}`}
                  style={{ 
                    textDecoration: 'none',
                    cursor: post.isComingSoon ? 'default' : 'pointer',
                    display: 'block',
                  }}
                >
                  <div style={{
                    padding: '30px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    transition: post.isComingSoon ? 'none' : 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    opacity: post.isComingSoon ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!post.isComingSoon) {
                      e.currentTarget.style.borderColor = '#000000';
                      e.currentTarget.style.backgroundColor = '#fafafa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!post.isComingSoon) {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }
                  }}
                  >
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
                          fontSize: isMobile ? '1.8rem' : '2.2rem',
                          fontWeight: '400',
                          color: post.isComingSoon ? '#999999' : '#000000',
                          margin: '0 0 16px 0',
                          letterSpacing: '-0.02em',
                          lineHeight: '1.2',
                        }}>
                          {post.title}
                        </h2>
                        
                        {post.isComingSoon ? (
                          <div style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            color: '#999999',
                            fontSize: '0.9rem',
                            marginBottom: '16px',
                            letterSpacing: '0.5px',
                          }}>
                            COMING SOON
                          </div>
                        ) : (
                          <p style={{
                            fontSize: isMobile ? '1.1rem' : '1.2rem',
                            color: '#666666',
                            marginBottom: '24px',
                            lineHeight: '1.6',
                            fontWeight: '300',
                          }}>
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '12px',
                          marginBottom: '24px',
                        }}>
                          {post.tags.map(tag => (
                            <span
                              key={tag}
                              onClick={(e) => {
                                if (!post.isComingSoon) {
                                  e.preventDefault();
                                  router.push(`/tag/${tag}`);
                                }
                              }}
                              style={{
                                padding: '4px 12px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                color: post.isComingSoon ? '#cccccc' : '#666666',
                                fontSize: '0.9rem',
                                cursor: post.isComingSoon ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (!post.isComingSoon) {
                                  e.currentTarget.style.borderColor = '#000000';
                                  e.currentTarget.style.color = '#000000';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!post.isComingSoon) {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.color = '#666666';
                                }
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '24px',
                          color: post.isComingSoon ? '#cccccc' : '#999999',
                          fontSize: '1rem',
                          fontWeight: '300',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <CalendarIcon width={20} height={20} />
                            <span>{new Date(post.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <ClockIcon width={20} height={20} />
                            <span>{post.readTime} menit</span>
                          </div>
                        </div>
                      </div>

                      {!post.isComingSoon && (
                        <motion.div
                          whileHover={{ x: 5 }}
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
                      )}
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
              color: '#999999',
              border: '1px dashed #e0e0e0',
              borderRadius: '4px',
            }}
          >
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>🏷️</span>
            <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: '300' }}>Belum ada artikel dengan tag ini.</p>
          </motion.div>
        )}

        {/* Other Tags */}
        {otherTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: '80px',
              paddingTop: '40px',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '400',
              color: '#000000',
              marginBottom: '20px',
              letterSpacing: '-0.01em',
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
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      color: '#666666',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#000000';
                      e.currentTarget.style.color = '#000000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.color = '#666666';
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
