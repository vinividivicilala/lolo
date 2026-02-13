'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

// Data blog posts
const BLOG_POSTS = [
  {
    id: 'gunadarma-article',
    title: 'Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma',
    slug: 'bagaimana-rasanya-masuk-kuliah-di-universitas-gunadarma',
    excerpt: 'Pengalaman pribadi menjalani perkuliahan di Universitas Gunadarma, dari akademik hingga organisasi.',
    tags: ['kuliah', 'gunadarma'],
    date: '2024-01-15',
    readTime: 8
  },
  {
    id: 'memilih-jurusan',
    title: 'Mengapa saya memilih jurusan tersebut',
    slug: 'memilih-jurusan',
    excerpt: 'Alasan di balik keputusan memilih program studi yang tepat.',
    tags: ['kuliah'],
    date: '2024-01-10',
    readTime: 5
  },
  {
    id: 'tips-belajar',
    title: 'Tips Belajar Efektif untuk Mahasiswa',
    slug: 'tips-belajar-efektif',
    excerpt: 'Cara belajar yang efektif agar IPK tetap memuaskan.',
    tags: ['kuliah'],
    date: '2024-01-05',
    readTime: 6
  },
  {
    id: 'organisasi-kampus',
    title: 'Pentingnya Ikut Organisasi Kampus',
    slug: 'pentingnya-ikut-organisasi-kampus',
    excerpt: 'Manfaat mengikuti organisasi selama kuliah.',
    tags: ['kuliah'],
    date: '2023-12-28',
    readTime: 7
  },
  {
    id: 'dosen-favorit',
    title: 'Dosen-Dosen Favorit di Gunadarma',
    slug: 'dosen-favorit-gunadarma',
    excerpt: 'Cerita tentang dosen-dosen yang menginspirasi.',
    tags: ['gunadarma'],
    date: '2023-12-20',
    readTime: 4
  },
  {
    id: 'fasilitas-kampus',
    title: 'Fasilitas Keren di Gunadarma',
    slug: 'fasilitas-keren-gunadarma',
    excerpt: 'Mengulas fasilitas-fasilitas yang tersedia di kampus.',
    tags: ['gunadarma'],
    date: '2023-12-15',
    readTime: 5
  }
];

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

export default function TagPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = params.tagId as string;
  
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Filter posts berdasarkan tag
  const filteredPosts = BLOG_POSTS.filter(post => post.tags.includes(tagId));

  // Info tag
  const tagInfo: { [key: string]: { name: string, description: string } } = {
    kuliah: {
      name: 'Kuliah',
      description: 'Kumpulan artikel tentang pengalaman, tips, dan cerita seputar perkuliahan.'
    },
    gunadarma: {
      name: 'Gunadarma',
      description: 'Artikel-artikel yang membahas tentang Universitas Gunadarma, dari sejarah hingga kehidupan kampus.'
    }
  };

  const currentTag = tagInfo[tagId] || { name: tagId, description: '' };

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

  if (!tagInfo[tagId]) {
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
      padding: isMobile ? '20px' : '40px',
    }}>
      
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '20px' : '40px',
        right: isMobile ? '20px' : '40px',
        zIndex: 100,
      }}>
        <Link href="/blog" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          textDecoration: 'none',
          color: 'white',
        }}>
          <span style={{
            fontSize: isMobile ? '1rem' : '1.2rem',
          }}>
            Kembali ke Blog
          </span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: isMobile ? '100px 0 40px' : '120px 0 60px',
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
            display: 'inline-block',
            padding: '8px 24px',
            backgroundColor: '#222222',
            border: '1px solid #444444',
            borderRadius: '40px',
            marginBottom: '20px',
          }}>
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
                    <h2 style={{
                      fontSize: isMobile ? '1.6rem' : '2rem',
                      fontWeight: 'normal',
                      color: 'white',
                      margin: '0 0 15px 0',
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
                          style={{
                            padding: '4px 12px',
                            backgroundColor: '#222222',
                            border: '1px solid #444444',
                            borderRadius: '20px',
                            color: '#cccccc',
                            fontSize: '0.85rem',
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
            gap: '15px',
          }}>
            {Object.keys(tagInfo).filter(t => t !== tagId).map((otherTag) => (
              <Link
                key={otherTag}
                href={`/tag/${otherTag}`}
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
                  #{otherTag}
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
