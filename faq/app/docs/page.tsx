'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [activeSubSection, setActiveSubSection] = useState("salam");
  const [isMobile, setIsMobile] = useState(false);
  const [showPembukaDropdown, setShowPembukaDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visitorCount, setVisitorCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Random visitor count generator (simulasi real-time)
  useEffect(() => {
    const baseCount = 1234;
    const interval = setInterval(() => {
      setVisitorCount(baseCount + Math.floor(Math.random() * 100));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // GSAP animation for marquee
  useEffect(() => {
    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, {
        x: "-100%",
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // GSAP animation for content
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [activeSection, activeSubSection]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPembukaDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Data navigasi dengan dropdown untuk pembuka
  const navItems = [
    { 
      id: "pembuka", 
      title: "PEMBUKA",
      hasDropdown: true,
      dropdownItems: [
        { id: "salam", title: "SALAM" },
        { id: "tutup", title: "TUTUP" },
        { id: "sejarah", title: "SEJARAH" },
        { id: "visi-misi", title: "VISI & MISI" }
      ]
    },
    { id: "arsitektur", title: "ARSITEKTUR" },
    { id: "instalasi", title: "INSTALASI" },
    { id: "penggunaan", title: "PENGGUNAAN" },
    { id: "keamanan", title: "KEAMANAN" },
    { id: "troubleshoot", title: "TROUBLESHOOT" },
    { id: "fitur", title: "FITUR" },
    { id: "api", title: "API REFERENCE" },
    { id: "faq", title: "FAQ" }
  ];

  // Data konten lengkap dan detail
  const contentData = {
    pembuka: {
      title: "PEMBUKA",
      sections: {
        salam: {
          title: "SALAM PEMBUKA",
          content: "Assalamu'alaikum Warahmatullahi Wabarakatuh. Salam sejahtera bagi kita semua. Selamat datang di platform MENURU, sebuah ekosistem digital yang dirancang untuk memudahkan Anda dalam mengakses, mengelola, dan mendistribusikan konten digital dengan cara yang paling efisien dan efektif."
        },
        tutup: {
          title: "TUTUP",
          content: "Terima kasih telah menggunakan platform MENURU. Kami berkomitmen untuk terus meningkatkan kualitas layanan dan memberikan pengalaman terbaik bagi seluruh pengguna. Wassalamu'alaikum Warahmatullahi Wabarakatuh."
        },
        sejarah: {
          title: "SEJARAH MENURU",
          content: "MENURU didirikan pada tahun 2023 oleh sekelompok pengembang yang peduli akan kebutuhan dokumentasi digital yang terstruktur. Berawal dari proyek internal, platform ini berkembang menjadi solusi dokumentasi yang digunakan oleh ribuan tim di seluruh Indonesia. Filosofi nama 'MENURU' berasal dari bahasa Sansekerta yang berarti 'panduan' atau 'petunjuk', mencerminkan misi utama platform ini sebagai pemandu dalam navigasi digital."
        },
        "visi-misi": {
          title: "VISI & MISI",
          content: "Visi MENURU adalah menjadi platform dokumentasi terdepan yang memberdayakan kreativitas dan produktivitas pengguna. Misi kami adalah menyediakan infrastruktur dokumentasi yang intuitif, aman, dan scalable, membangun komunitas berbagi pengetahuan yang aktif, serta terus berinovasi dalam teknologi dokumentasi digital untuk memenuhi kebutuhan pengguna yang terus berkembang."
        }
      }
    },
    arsitektur: {
      title: "ARSITEKTUR",
      description: "Platform MENURU dibangun dengan arsitektur modern yang scalable dan reliable. Menggunakan teknologi terbaru untuk memastikan performa optimal dan keamanan data pengguna.",
      details: [
        "Microservices Architecture dengan containerization menggunakan Docker",
        "Load balancing dan auto-scaling untuk menangani traffic tinggi",
        "Database terdistribusi dengan replication dan sharding",
        "Caching layer menggunakan Redis untuk performa maksimal",
        "CDN integration untuk pengiriman konten global",
        "Event-driven architecture untuk real-time updates",
        "GraphQL API untuk fleksibilitas data fetching",
        "Serverless functions untuk operasi tertentu"
      ],
      techStack: {
        frontend: "Next.js 14, React, TypeScript, TailwindCSS",
        backend: "Node.js, Python FastAPI, Go",
        database: "PostgreSQL, MongoDB, Redis",
        infrastructure: "AWS, Kubernetes, Docker"
      }
    },
    instalasi: {
      title: "INSTALASI",
      description: "Proses instalasi platform dirancang sederhana dan cepat. Panduan lengkap tersedia untuk berbagai lingkungan deployment.",
      steps: [
        {
          title: "Persiapan Environment",
          commands: [
            "Node.js 18+ atau lebih baru",
            "npm atau yarn package manager",
            "Git untuk version control",
            "Docker (opsional untuk containerization)"
          ]
        },
        {
          title: "Clone Repository",
          commands: [
            "git clone https://github.com/menuru/platform.git",
            "cd platform"
          ]
        },
        {
          title: "Install Dependencies",
          commands: [
            "npm install",
            "# atau",
            "yarn install"
          ]
        },
        {
          title: "Konfigurasi Environment",
          commands: [
            "cp .env.example .env",
            "# Edit file .env sesuai kebutuhan"
          ]
        },
        {
          title: "Jalankan Development Server",
          commands: [
            "npm run dev",
            "# Aplikasi akan berjalan di http://localhost:3000"
          ]
        }
      ],
      docker: [
        "docker build -t menuru-platform .",
        "docker-compose up -d"
      ]
    },
    penggunaan: {
      title: "PENGGUNAAN",
      description: "Platform menyediakan berbagai fitur untuk kebutuhan digital sehari-hari.",
      features: [
        {
          name: "Manajemen Konten",
          description: "Buat, edit, dan kelola konten dengan mudah melalui dashboard intuitif"
        },
        {
          name: "Kolaborasi Tim",
          description: "Fitur real-time collaboration untuk bekerja bersama tim"
        },
        {
          name: "Version Control",
          description: "Track perubahan dan rollback ke versi sebelumnya"
        },
        {
          name: "Analytics Dashboard",
          description: "Pantau performa konten dengan metrik lengkap"
        },
        {
          name: "Export/Import Data",
          description: "Ekspor dan impor data dalam berbagai format (PDF, DOCX, Markdown)"
        },
        {
          name: "API Integration",
          description: "Integrasikan dengan aplikasi lain melalui REST API"
        }
      ],
      shortcuts: [
        "Ctrl/Cmd + K - Buka command palette",
        "Ctrl/Cmd + S - Simpan perubahan",
        "Ctrl/Cmd + F - Pencarian",
        "Ctrl/Cmd + B - Toggle sidebar"
      ]
    },
    keamanan: {
      title: "KEAMANAN",
      description: "Keamanan data dan privasi pengguna adalah prioritas utama.",
      features: [
        "Enkripsi end-to-end untuk semua data",
        "Two-factor authentication (2FA)",
        "Role-based access control (RBAC)",
        "Audit logs untuk semua aktivitas",
        "Regular security audits dan penetration testing",
        "GDPR compliance",
        "Data backup otomatis setiap 6 jam",
        "DDoS protection",
        "SQL injection prevention",
        "XSS protection"
      ],
      certifications: [
        "ISO 27001 Certified",
        "SOC 2 Type II",
        "GDPR Compliant"
      ]
    },
    troubleshoot: {
      title: "TROUBLESHOOT",
      description: "Solusi untuk masalah umum yang mungkin dihadapi pengguna.",
      issues: [
        {
          problem: "Halaman tidak dapat diakses",
          solution: "Periksa koneksi internet, clear cache browser, atau coba akses dari mode incognito"
        },
        {
          problem: "Login gagal",
          solution: "Reset password melalui email, pastikan caps lock non-aktif, atau hubungi admin"
        },
        {
          problem: "Konten tidak muncul",
          solution: "Refresh halaman, cek permission user, atau clear cache aplikasi"
        },
        {
          problem: "Upload file gagal",
          solution: "Periksa ukuran file (max 100MB), format file yang didukung, atau cek storage quota"
        },
        {
          problem: "Notifikasi tidak masuk",
          solution: "Cek setting notifikasi, pastikan browser mengizinkan notifikasi, atau cek spam folder"
        }
      ],
      support: "Untuk masalah lebih lanjut, hubungi support@menuru.com atau chat live dengan tim kami"
    },
    fitur: {
      title: "FITUR LENGKAP",
      description: "MENURU hadir dengan berbagai fitur canggih untuk memenuhi kebutuhan dokumentasi Anda.",
      categories: [
        {
          name: "Content Management",
          items: [
            "Rich text editor dengan Markdown support",
            "Drag-and-drop file upload",
            "Media library dengan manajemen aset",
            "Template system untuk dokumentasi",
            "Bulk operations untuk multiple files"
          ]
        },
        {
          name: "Collaboration",
          items: [
            "Real-time editing dengan multiple users",
            "Comments dan mentions",
            "Version history dengan diff view",
            "Approval workflows",
            "Team spaces dengan custom permissions"
          ]
        },
        {
          name: "Analytics",
          items: [
            "Page views dan unique visitors",
            "User engagement metrics",
            "Search analytics",
            "Export reports dalam berbagai format",
            "Custom dashboard dengan widgets"
          ]
        },
        {
          name: "Integration",
          items: [
            "Slack integration untuk notifications",
            "GitHub/GitLab sync",
            "Zapier connect untuk automation",
            "Webhooks untuk custom integrations",
            "REST API dengan documentation lengkap"
          ]
        }
      ]
    },
    api: {
      title: "API REFERENCE",
      description: "Dokumentasi lengkap untuk mengintegrasikan MENURU dengan aplikasi Anda.",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/documents",
          description: "Mendapatkan daftar semua dokumen"
        },
        {
          method: "GET",
          path: "/api/v1/documents/:id",
          description: "Mendapatkan detail dokumen spesifik"
        },
        {
          method: "POST",
          path: "/api/v1/documents",
          description: "Membuat dokumen baru"
        },
        {
          method: "PUT",
          path: "/api/v1/documents/:id",
          description: "Mengupdate dokumen"
        },
        {
          method: "DELETE",
          path: "/api/v1/documents/:id",
          description: "Menghapus dokumen"
        }
      ],
      auth: "Semua request memerlukan API key yang dapat diperoleh dari dashboard settings. Gunakan header 'Authorization: Bearer YOUR_API_KEY'"
    },
    faq: {
      title: "FAQ",
      description: "Pertanyaan yang sering diajukan",
      questions: [
        {
          q: "Apakah MENURU gratis?",
          a: "MENURU menawarkan free tier dengan fitur dasar. Untuk kebutuhan lebih lanjut, tersedia paket Pro dan Enterprise dengan berbagai fitur tambahan."
        },
        {
          q: "Bagaimana cara upgrade paket?",
          a: "Anda dapat melakukan upgrade melalui dashboard settings. Pembayaran dapat dilakukan via transfer bank, kartu kredit, atau virtual account."
        },
        {
          q: "Apakah data saya aman?",
          a: "Ya, semua data dienkripsi dan disimpan dengan standar keamanan tertinggi. Kami juga melakukan backup rutin untuk mencegah kehilangan data."
        },
        {
          q: "Bisakah mengakses offline?",
          a: "Saat ini MENURU memerlukan koneksi internet. Namun fitur offline mode sedang dalam pengembangan dan akan dirilis tahun depan."
        },
        {
          q: "Bagaimana cara bergabung dengan tim?",
          a: "Admin tim dapat mengundang anggota melalui email. Setiap anggota akan mendapatkan akses sesuai role yang ditentukan."
        }
      ]
    }
  };

  // Format waktu
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mendapatkan konten berdasarkan section aktif
  const getCurrentContent = () => {
    if (activeSection === "pembuka") {
      return contentData.pembuka.sections[activeSubSection as keyof typeof contentData.pembuka.sections];
    }
    return contentData[activeSection as keyof typeof contentData];
  };

  const currentContent = getCurrentContent();

  // Arrow SVG component
  const ArrowIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', marginLeft: '8px' }}
    >
      <path 
        d="M7 17L17 7M17 7H8M17 7V16" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: 'white',
      cursor: 'default'
    }}>
      
      {/* Left Navigation */}
      <div style={{
        width: '260px',
        padding: '2rem 1.5rem',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 10,
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: '800',
          marginBottom: '2rem',
          lineHeight: 1,
          opacity: 0.9,
          letterSpacing: '2px'
        }}>
          MENURU
        </div>
        
        {/* Real-time Info */}
        <div style={{
          marginBottom: '2rem',
          padding: '1rem 0.5rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.85rem',
          opacity: 0.8
        }}>
          <div style={{ marginBottom: '0.5rem' }}>📅 {formatDate(currentTime)}</div>
          <div style={{ marginBottom: '0.5rem' }}>⏰ {formatTime(currentTime)}</div>
          <div>👥 Online: {visitorCount}</div>
        </div>

        {/* Author Info */}
        <div style={{
          marginBottom: '2rem',
          padding: '1rem 0.5rem',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>✍️ AUTHOR</div>
          <div>Tim Pengembang MENURU</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>v.2.0.0</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>contact@menuru.com</div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.1rem',
        }}>
          {navItems.map((item) => (
            <div 
              key={item.id}
              style={{ position: 'relative' }}
            >
              <div
                onClick={() => {
                  if (item.hasDropdown) {
                    setShowPembukaDropdown(!showPembukaDropdown);
                  } else {
                    setActiveSection(item.id);
                    setShowPembukaDropdown(false);
                  }
                }}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: activeSection === item.id ? '700' : '400',
                  cursor: 'pointer',
                  padding: '0.6rem 0.5rem',
                  opacity: activeSection === item.id ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.5px',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: activeSection === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderLeft: activeSection === item.id ? '2px solid white' : '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{item.title}</span>
                {item.hasDropdown && (
                  <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>▼</span>
                )}
              </div>
              
              {/* Dropdown untuk Pembuka */}
              {item.id === "pembuka" && showPembukaDropdown && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'relative',
                    paddingLeft: '1rem',
                    marginTop: '0.1rem'
                  }}
                >
                  {item.dropdownItems?.map((dropdownItem) => (
                    <div
                      key={dropdownItem.id}
                      onClick={() => {
                        setActiveSection("pembuka");
                        setActiveSubSection(dropdownItem.id);
                        setShowPembukaDropdown(false);
                      }}
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: activeSubSection === dropdownItem.id ? '600' : '400',
                        cursor: 'pointer',
                        padding: '0.5rem 0.5rem',
                        opacity: activeSubSection === dropdownItem.id ? 1 : 0.5,
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.5px',
                        lineHeight: '1.2',
                        backgroundColor: activeSubSection === dropdownItem.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                        borderLeft: activeSubSection === dropdownItem.id ? '2px solid white' : '2px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (activeSubSection !== dropdownItem.id) {
                          e.currentTarget.style.opacity = '0.8';
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeSubSection !== dropdownItem.id) {
                          e.currentTarget.style.opacity = '0.5';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {dropdownItem.title}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: '260px',
        flex: 1,
        padding: '2rem 3rem 4rem 8rem',
        minHeight: '100vh',
        marginRight: '2rem'
      }}>
        
        {/* Marquee Text */}
        <div style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginBottom: '3rem',
          padding: '0.5rem 0',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(255,255,255,0.02)'
        }}>
          <div ref={marqueeRef} style={{ display: 'inline-block' }}>
            <span style={{ fontSize: '1rem', letterSpacing: '2px' }}>
              DOCS MENURU <ArrowIcon /> 
              DOKUMENTASI LENGKAP <ArrowIcon />
              PANDUAN PENGGUNAAN <ArrowIcon />
              API REFERENCE <ArrowIcon />
              TUTORIAL <ArrowIcon />
              BEST PRACTICES <ArrowIcon />
              DOCS MENURU <ArrowIcon />
            </span>
          </div>
        </div>

        <div ref={contentRef} style={{ maxWidth: '900px' }}>
          
          {/* Judul Besar */}
          <div style={{
            fontSize: '4rem',
            fontWeight: '900',
            lineHeight: 1,
            letterSpacing: '-1px',
            marginBottom: '2rem',
            paddingLeft: '1.5rem'
          }}>
            {activeSection === "pembuka" 
              ? contentData.pembuka.sections[activeSubSection as keyof typeof contentData.pembuka.sections]?.title
              : contentData[activeSection as keyof typeof contentData]?.title}
          </div>

          {/* Konten Utama */}
          <div style={{
            fontSize: '1.1rem',
            lineHeight: 1.8,
            opacity: 0.9,
            fontWeight: '300',
            letterSpacing: '0.2px',
            paddingLeft: '1.5rem',
            paddingRight: '2rem'
          }}>
            {activeSection === "pembuka" ? (
              <>
                <p style={{ marginBottom: '2rem' }}>
                  {contentData.pembuka.sections[activeSubSection as keyof typeof contentData.pembuka.sections]?.content}
                </p>
                {/* Tambahan konten untuk setiap sub-section */}
                {activeSubSection === "sejarah" && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Timeline Perkembangan</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      <li style={{ marginBottom: '1rem', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
                        <strong>2023 Q1:</strong> Ide awal dan perencanaan
                      </li>
                      <li style={{ marginBottom: '1rem', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
                        <strong>2023 Q2:</strong> Pengembangan prototype
                      </li>
                      <li style={{ marginBottom: '1rem', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
                        <strong>2023 Q3:</strong> Beta testing dengan 100 pengguna
                      </li>
                      <li style={{ marginBottom: '1rem', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
                        <strong>2023 Q4:</strong> Launching resmi versi 1.0
                      </li>
                      <li style={{ marginBottom: '1rem', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
                        <strong>2024:</strong> Pengembangan fitur AI dan integrasi lanjutan
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{ marginBottom: '2rem' }}>{(currentContent as any).description}</p>
                
                {/* Dynamic content based on section */}
                {activeSection === "arsitektur" && (
                  <>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Detail Arsitektur</h3>
                    <ul style={{ marginBottom: '2rem' }}>
                      {(contentData.arsitektur as any).details.map((detail: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>• {detail}</li>
                      ))}
                    </ul>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Technology Stack</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <strong>Frontend:</strong> {(contentData.arsitektur as any).techStack.frontend}
                      </div>
                      <div>
                        <strong>Backend:</strong> {(contentData.arsitektur as any).techStack.backend}
                      </div>
                      <div>
                        <strong>Database:</strong> {(contentData.arsitektur as any).techStack.database}
                      </div>
                      <div>
                        <strong>Infrastructure:</strong> {(contentData.arsitektur as any).techStack.infrastructure}
                      </div>
                    </div>
                  </>
                )}

                {activeSection === "instalasi" && (
                  <>
                    {(contentData.instalasi as any).steps.map((step: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem' }}>
                          {idx + 1}. {step.title}
                        </h3>
                        <ul style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '4px' }}>
                          {step.commands.map((cmd: string, cmdIdx: number) => (
                            <li key={cmdIdx} style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}>$ {cmd}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Docker Deployment</h3>
                    <ul style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '4px' }}>
                      {(contentData.instalasi as any).docker.map((cmd: string, idx: number) => (
                        <li key={idx} style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}>$ {cmd}</li>
                      ))}
                    </ul>
                  </>
                )}

                {activeSection === "penggunaan" && (
                  <>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Fitur Utama</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      {(contentData.penggunaan as any).features.map((feature: any, idx: number) => (
                        <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px' }}>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>{feature.name}</h4>
                          <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>{feature.description}</p>
                        </div>
                      ))}
                    </div>
                    
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Keyboard Shortcuts</h3>
                    <ul style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '4px' }}>
                      {(contentData.penggunaan as any).shortcuts.map((shortcut: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>• {shortcut}</li>
                      ))}
                    </ul>
                  </>
                )}

                {activeSection === "keamanan" && (
                  <>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Fitur Keamanan</h3>
                    <ul style={{ marginBottom: '2rem', columns: 2 }}>
                      {(contentData.keamanan as any).features.map((feature: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>• {feature}</li>
                      ))}
                    </ul>
                    
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Sertifikasi</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {(contentData.keamanan as any).certifications.map((cert: string, idx: number) => (
                        <span key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                          {cert}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {activeSection === "troubleshoot" && (
                  <>
                    {(contentData.troubleshoot as any).issues.map((issue: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#ff6b6b' }}>
                          ⚠️ {issue.problem}
                        </h3>
                        <p style={{ fontSize: '1rem' }}>✅ {issue.solution}</p>
                      </div>
                    ))}
                    
                    <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Need More Help?</h3>
                      <p>{(contentData.troubleshoot as any).support}</p>
                    </div>
                  </>
                )}

                {activeSection === "fitur" && (
                  <>
                    {(contentData.fitur as any).categories.map((category: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                          {category.name}
                        </h3>
                        <ul style={{ columns: 2 }}>
                          {category.items.map((item: string, itemIdx: number) => (
                            <li key={itemIdx} style={{ marginBottom: '0.5rem' }}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </>
                )}

                {activeSection === "api" && (
                  <>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Authentication</h3>
                    <p style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '4px' }}>
                      {(contentData.api as any).auth}
                    </p>
                    
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0 1rem' }}>Endpoints</h3>
                    {(contentData.api as any).endpoints.map((endpoint: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <span style={{ 
                            backgroundColor: endpoint.method === 'GET' ? '#2ecc71' : endpoint.method === 'POST' ? '#3498db' : endpoint.method === 'PUT' ? '#f39c12' : '#e74c3c',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            {endpoint.method}
                          </span>
                          <span style={{ fontFamily: 'monospace' }}>{endpoint.path}</span>
                        </div>
                        <p style={{ marginLeft: '1rem', fontSize: '0.95rem', opacity: 0.8 }}>{endpoint.description}</p>
                      </div>
                    ))}
                  </>
                )}

                {activeSection === "faq" && (
                  <>
                    {(contentData.faq as any).questions.map((faq: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#3498db' }}>
                          Q: {faq.q}
                        </h3>
                        <p style={{ fontSize: '1rem', marginLeft: '1rem', opacity: 0.9 }}>
                          A: {faq.a}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* Additional Info */}
          <div style={{
            marginTop: '4rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '800px',
            paddingLeft: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.5,
                letterSpacing: '0.5px'
              }}>
                Dokumentasi Terakhir Diperbarui: Desember 2024
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.5,
                marginTop: '0.5rem',
                letterSpacing: '0.5px'
              }}>
                Versi Platform: 2.0.0
              </div>
            </div>
            <div style={{
              fontSize: '0.9rem',
              opacity: 0.5,
              textAlign: 'right'
            }}>
              <div>Author: Tim Pengembang MENURU</div>
              <div>© 2024 MENURU Inc.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
