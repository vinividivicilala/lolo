'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [isMobile, setIsMobile] = useState(false);
  const [showPembukaDropdown, setShowPembukaDropdown] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  
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
  }, [activeSection]);

  // Real-time timestamp
  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const formattedTime = now.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setTimeAgo(formattedTime);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Marquee animation
  useEffect(() => {
    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, {
        x: "-100%",
        duration: 20,
        ease: "none",
        repeat: -1
      });
    }
  }, []);

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
      dropdownItems: ["SALAM PEMBUKA", "VISI & MISI", "TENTANG PLATFORM", "SEJARAH", "TIM PENGEMBANG"]
    },
    { id: "arsitektur", title: "ARSITEKTUR" },
    { id: "instalasi", title: "INSTALASI" },
    { id: "penggunaan", title: "PENGGUNAAN" },
    { id: "keamanan", title: "KEAMANAN" },
    { id: "troubleshoot", title: "TROUBLESHOOT" },
    { id: "fitur", title: "FITUR" },
    { id: "api", title: "API REFERENCE" },
    { id: "integrasi", title: "INTEGRASI" }
  ];

  // Data konten lengkap dan detail
  const contentData = {
    pembuka: {
      title: "PEMBUKA",
      description: "Selamat datang di dokumentasi platform MENURU. Platform ini dirancang untuk memberikan pengalaman optimal dalam membaca, menulis, dan mengeksplorasi berbagai jenis konten digital dengan antarmuka yang intuitif dan performa yang handal.",
      fullContent: {
        salam: "Assalamu'alaikum Warahmatullahi Wabarakatuh dan Salam Sejahtera bagi kita semua. Selamat datang di platform MENURU - solusi digital modern untuk kebutuhan dokumentasi dan konten Anda.",
        visiMisi: "Visi: Menjadi platform dokumentasi terdepan yang memberdayakan kreativitas dan produktivitas pengguna di seluruh dunia. Misi: Menyediakan antarmuka yang intuitif, performa yang handal, dan fitur-fitur inovatif untuk memudahkan pengelolaan konten digital.",
        tentang: "MENURU adalah platform dokumentasi digital yang dikembangkan sejak 2023 oleh tim pengembang berpengalaman. Platform ini menggabungkan kemudahan penggunaan dengan kekuatan teknologi modern untuk menciptakan pengalaman dokumentasi yang tak tertandingi.",
        sejarah: "Berawal dari kebutuhan internal tim pengembang akan platform dokumentasi yang sederhana namun powerful, MENURU lahir pada tahun 2023. Dalam waktu singkat, platform ini berkembang menjadi solusi dokumentasi pilihan bagi ribuan pengguna di Indonesia.",
        tim: "Dikembangkan oleh tim yang berdedikasi tinggi dengan latar belakang beragam: pengembang software, desainer UI/UX, technical writer, dan spesialis keamanan siber. Tim kami berkomitmen untuk terus mengembangkan dan meningkatkan platform MENURU."
      }
    },
    arsitektur: {
      title: "ARSITEKTUR",
      description: "Platform MENURU dibangun dengan arsitektur modern yang scalable dan reliable. Menggunakan teknologi terbaru untuk memastikan performa optimal dan keamanan data pengguna dalam berbagai skenario penggunaan.",
      fullContent: {
        overview: "Arsitektur MENURU menggunakan pendekatan microservices dengan containerization untuk memastikan skalabilitas dan kemudahan maintenance.",
        frontend: "Frontend dibangun dengan React.js dan Next.js 14, memanfaatkan server-side rendering untuk performa optimal dan SEO-friendly. State management menggunakan Redux Toolkit dan Context API untuk menangani data kompleks.",
        backend: "Backend menggunakan Node.js dengan Express.js framework, didukung oleh database PostgreSQL untuk data utama dan Redis untuk caching. API dirancang dengan RESTful principles dan GraphQL untuk fleksibilitas query.",
        infrastructure: "Infrastruktur di-host pada cloud platform dengan auto-scaling capability. Menggunakan Docker containers dan Kubernetes untuk orchestration, serta CI/CD pipeline untuk deployment otomatis.",
        performance: "Optimasi performa mencakup code splitting, lazy loading, image optimization, dan CDN integration untuk pengiriman konten yang cepat ke seluruh dunia."
      }
    },
    instalasi: {
      title: "INSTALASI",
      description: "Proses instalasi platform dirancang sederhana dan cepat. Panduan lengkap tersedia untuk berbagai lingkungan deployment dengan opsi konfigurasi yang fleksibel sesuai kebutuhan pengguna.",
      fullContent: {
        prerequisites: "Persyaratan sistem: Node.js 18+, PostgreSQL 14+, Redis 6+, dan minimal 2GB RAM. Disarankan menggunakan sistem operasi Linux (Ubuntu 20.04 atau lebih baru).",
        quickStart: "Instalasi cepat: clone repository, jalankan 'npm install', konfigurasi environment variables, dan 'npm run dev' untuk development mode.",
        production: "Untuk production deployment, gunakan Docker: 'docker-compose up -d' atau deploy ke platform seperti Vercel, Netlify, atau cloud providers.",
        configuration: "Konfigurasi meliputi database connection, API keys, environment variables, dan pengaturan keamanan seperti CORS dan rate limiting.",
        troubleshooting: "Jika mengalami kendala instalasi, periksa log error, pastikan semua dependensi terinstall, dan verifikasi koneksi database."
      }
    },
    penggunaan: {
      title: "PENGGUNAAN",
      description: "Platform menyediakan berbagai fitur untuk kebutuhan digital sehari-hari. Antarmuka yang intuitif memudahkan navigasi dan penggunaan tanpa memerlukan pelatihan khusus.",
      fullContent: {
        dashboard: "Dashboard utama menampilkan ringkasan aktivitas, statistik penggunaan, dan akses cepat ke fitur-fitur utama. Dapat dikustomisasi sesuai preferensi pengguna.",
        contentCreation: "Buat konten baru dengan mudah menggunakan editor WYSIWYG yang dilengkapi formatting tools, media embedding, dan template siap pakai.",
        collaboration: "Fitur kolaborasi memungkinkan multiple users bekerja pada dokumen yang sama secara real-time dengan version control dan comment system.",
        organization: "Organisasi konten menggunakan folder, tags, dan kategori. Pencarian full-text dengan filter untuk menemukan konten dengan cepat.",
        export: "Ekspor konten ke berbagai format: PDF, Markdown, HTML, atau Word. Mendukung batch export dan scheduled exports."
      }
    },
    keamanan: {
      title: "KEAMANAN",
      description: "Keamanan data dan privasi pengguna adalah prioritas utama. Platform menerapkan enkripsi end-to-end dan protokol keamanan terkini untuk melindungi semua informasi yang disimpan.",
      fullContent: {
        encryption: "Data dienkripsi menggunakan AES-256 untuk data at-rest dan TLS 1.3 untuk data in-transit. Password di-hash dengan bcrypt dan salt unik.",
        authentication: "Multi-factor authentication (MFA) dengan dukungan Google Authenticator, SMS, atau email. OAuth2 integration untuk login dengan Google, GitHub, atau enterprise SSO.",
        authorization: "Role-based access control (RBAC) dengan permission granular. Mendukung team roles dan custom permissions untuk fleksibilitas akses.",
        audit: "Audit logging mencatat semua aktivitas penting: login attempts, content changes, permission modifications. Log disimpan minimal 90 hari.",
        compliance: "Platform mematuhi standar keamanan: GDPR, HIPAA, dan ISO 27001. Dilengkapi dengan data backup otomatis dan disaster recovery plan."
      }
    },
    troubleshoot: {
      title: "TROUBLESHOOT",
      description: "Dokumentasi ini menyediakan solusi untuk masalah umum yang mungkin dihadapi pengguna. Setiap solusi dijelaskan dengan langkah-langkah yang jelas dan mudah diikuti.",
      fullContent: {
        commonIssues: "Masalah umum: Loading lambat, error 404, login gagal, data tidak tersimpan, dan rendering issues. Semua memiliki solusi terdokumentasi.",
        performance: "Jika platform lambat, coba clear cache, kurangi penggunaan browser extensions, atau upgrade koneksi internet. Untuk server, scale resources atau optimasi database.",
        errors: "Error codes dan penanganannya: 400 (Bad Request) - periksa input data, 401 (Unauthorized) - login ulang, 403 (Forbidden) - cek permissions, 500 (Server Error) - hubungi tim support.",
        dataRecovery: "Kehilangan data? Cek recycle bin (penyimpanan 30 hari), restore dari backup (tersedia 90 hari), atau hubungi support dengan timestamp kejadian.",
        contact: "Jika masalah berlanjut, hubungi support melalui: email (support@menuru.com), live chat (24/7), atau buat ticket di portal support. Sertakan screenshot dan deskripsi detail."
      }
    },
    fitur: {
      title: "FITUR",
      description: "MENURU dilengkapi dengan berbagai fitur canggih untuk memaksimalkan produktivitas dan kreativitas pengguna dalam mengelola konten digital.",
      fullContent: {
        editor: "Rich text editor dengan real-time collaboration, comment system, version history, dan AI-powered writing assistance. Mendukung markdown, code blocks, dan embed media.",
        analytics: "Analytics dashboard menampilkan metrics: page views, user engagement, popular content, dan conversion tracking. Export data ke CSV atau integrasi dengan Google Analytics.",
        automation: "Workflow automation dengan triggers dan actions. Contoh: auto-publish, email notifications, Slack integration, dan webhook untuk custom automations.",
        templates: "Library templates untuk berbagai kebutuhan: blog posts, documentation, product manuals, API docs, dan company wikis. Bisa kustom dan share templates.",
        api: "RESTful API dan GraphQL untuk integrasi dengan aplikasi eksternal. Dokumentasi interaktif dengan Swagger UI dan contoh kode dalam berbagai bahasa."
      }
    },
    api: {
      title: "API REFERENCE",
      description: "Dokumentasi lengkap API untuk pengembang yang ingin mengintegrasikan platform MENURU dengan aplikasi atau layanan eksternal.",
      fullContent: {
        authentication: "API menggunakan API keys untuk authentication. Setiap request harus menyertakan header 'X-API-Key'. Dapatkan API key dari dashboard settings.",
        endpoints: "Endpoints utama: /api/content, /api/users, /api/analytics, /api/search. Semua endpoint mendukung pagination, filtering, dan sorting.",
        rateLimiting: "Rate limits: 1000 requests per hour untuk free tier, unlimited untuk enterprise. Response headers menunjukkan remaining quota dan reset time.",
        webhooks: "Webhooks untuk event-driven integrations. Events: content.created, content.updated, user.registered, dan lainnya. Payload dapat dikustomisasi.",
        sdks: "Official SDKs tersedia untuk JavaScript/TypeScript, Python, PHP, Java, dan Ruby. Library open-source dengan dokumentasi dan contoh penggunaan."
      }
    },
    integrasi: {
      title: "INTEGRASI",
      description: "Platform MENURU dapat diintegrasikan dengan berbagai tools dan layanan populer untuk memperluas fungsionalitas dan meningkatkan produktivitas.",
      fullContent: {
        cloud: "Integrasi dengan cloud storage: Google Drive, Dropbox, OneDrive, dan AWS S3 untuk backup dan sync konten otomatis.",
        communication: "Integrasi dengan Slack, Discord, Microsoft Teams untuk notifications dan updates. Dapat mengirim pesan saat konten dibuat atau diupdate.",
        analytics: "Integrasi dengan Google Analytics, Mixpanel, dan Amplitude untuk tracking lanjutan. Data user behavior dapat dianalisis lebih dalam.",
        cms: "Integrasi dengan CMS populer: WordPress, Contentful, Strapi untuk sync konten dua arah. Mendukung webhooks untuk real-time updates.",
        developer: "Developer tools: Git integration untuk version control, CI/CD pipelines untuk auto-deploy, dan monitoring tools seperti Sentry dan Datadog."
      }
    }
  };

  // Author data
  const authors = [
    { name: "Ahmad Fauzi", role: "Lead Developer", avatar: "👨‍💻", contributions: "Full-stack development, system architecture" },
    { name: "Siti Nurhaliza", role: "Technical Writer", avatar: "✍️", contributions: "Documentation, tutorials, user guides" },
    { name: "Budi Santoso", role: "UI/UX Designer", avatar: "🎨", contributions: "Interface design, user experience" },
    { name: "Dewi Lestari", role: "Security Specialist", avatar: "🔒", contributions: "Security protocols, penetration testing" },
    { name: "Rizki Pratama", role: "DevOps Engineer", avatar: "⚙️", contributions: "Infrastructure, deployment, monitoring" }
  ];

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
        width: '280px',
        padding: '3rem 1.5rem',
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
          marginBottom: '2.5rem',
          lineHeight: 1,
          opacity: 0.9,
          letterSpacing: '-0.5px'
        }}>
          MENURU
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
                  padding: '0.5rem 0.5rem',
                  opacity: activeSection === item.id ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.5px',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: activeSection === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderLeft: activeSection === item.id ? '2px solid white' : '2px solid transparent',
                  paddingLeft: activeSection === item.id ? '0.3rem' : '0.5rem'
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
                {item.hasDropdown && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>▼</span>}
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
                    paddingLeft: '1.2rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.2rem'
                  }}
                >
                  {item.dropdownItems?.map((dropdownItem, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        console.log(`${dropdownItem} clicked`);
                        setActiveSection("pembuka");
                        setShowPembukaDropdown(false);
                      }}
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: '400',
                        cursor: 'pointer',
                        padding: '0.3rem 0.5rem',
                        opacity: 0.6,
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.3px',
                        lineHeight: '1.2',
                        backgroundColor: 'transparent',
                        borderLeft: '1px solid rgba(255,255,255,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.6';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {dropdownItem}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Author info di sidebar */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.8rem',
          opacity: 0.5
        }}>
          <div>© 2024 MENURU Docs</div>
          <div style={{ marginTop: '0.3rem' }}>v1.0.0</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: '280px',
        flex: 1,
        padding: '2rem 3rem 4rem 6rem',
        minHeight: '100vh',
      }}>
        {/* Marquee Text */}
        <div style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginBottom: '2rem',
          padding: '0.5rem 0',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(255,255,255,0.02)'
        }}>
          <div ref={marqueeRef} style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            paddingRight: '100%'
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
              DOCS MENURU • DOKUMENTASI LENGKAP • PANDUAN PENGGUNAAN • API REFERENCE • TUTORIAL • 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', margin: '0 10px', verticalAlign: 'middle' }}>
                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              DOCS MENURU • DOKUMENTASI LENGKAP • PANDUAN PENGGUNAAN • API REFERENCE • TUTORIAL •
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', margin: '0 10px', verticalAlign: 'middle' }}>
                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Real-time timestamp */}
        <div style={{
          marginBottom: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '4px',
          fontSize: '0.9rem',
          opacity: 0.7,
          display: 'inline-block'
        }}>
          🕒 Terakhir diperbarui: {timeAgo}
        </div>

        <div ref={contentRef} style={{ maxWidth: '900px' }}>
          
          {/* Judul Besar */}
          <div style={{
            fontSize: '4rem',
            fontWeight: '900',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: '2rem',
            paddingLeft: '1rem'
          }}>
            {contentData[activeSection as keyof typeof contentData]?.title}
          </div>

          {/* Deskripsi Utama */}
          <div style={{
            fontSize: '1.2rem',
            lineHeight: 1.7,
            opacity: 0.9,
            fontWeight: '300',
            letterSpacing: '0.2px',
            paddingLeft: '1rem',
            paddingRight: '2rem',
            marginBottom: '3rem'
          }}>
            {contentData[activeSection as keyof typeof contentData]?.description}
          </div>

          {/* Konten Lengkap */}
          <div style={{
            paddingLeft: '1rem',
            paddingRight: '2rem'
          }}>
            {Object.entries(contentData[activeSection as keyof typeof contentData]?.fullContent || {}).map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginBottom: '2.5rem'
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  opacity: 0.9,
                  textTransform: 'capitalize',
                  borderLeft: '3px solid white',
                  paddingLeft: '1rem'
                }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div style={{
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  opacity: 0.8,
                  fontWeight: '300'
                }}>
                  {value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Authors Section */}
          <div style={{
            marginTop: '4rem',
            padding: '2rem 1rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              opacity: 0.9
            }}>
              TIM PENGEMBANG
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {authors.map((author, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{author.avatar}</div>
                  <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{author.name}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.5rem' }}>{author.role}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{author.contributions}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div style={{
            marginTop: '3rem',
            paddingLeft: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.5,
                letterSpacing: '0.5px',
                marginBottom: '0.5rem'
              }}>
                DOKUMENTASI TERAKHIR DIPERBARUI
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Desember 2024
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.5,
                letterSpacing: '0.5px',
                marginBottom: '0.5rem'
              }}>
                VERSI PLATFORM
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                1.0.0 (Stable)
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.5,
                letterSpacing: '0.5px',
                marginBottom: '0.5rem'
              }}>
                LISENSI
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                MIT License
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
