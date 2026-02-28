'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [activeSubSection, setActiveSubSection] = useState("salam");
  const [isMobile, setIsMobile] = useState(false);
  const [showPembukaDropdown, setShowPembukaDropdown] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const marqueeContentRef = useRef<HTMLDivElement>(null);
  
  // Handle client-side only rendering untuk menghindari hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setCurrentDateTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
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
    // GSAP animation for content - hanya jalan di client
    if (contentRef.current && isClient) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [activeSection, activeSubSection, isClient]);

  // GSAP animation for marquee - hanya jalan di client
  useEffect(() => {
    if (marqueeContentRef.current && isClient) {
      gsap.to(marqueeContentRef.current, {
        x: "-50%",
        duration: 20,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % (marqueeContentRef.current?.offsetWidth / 2 || 0))
        }
      });
    }

    return () => {
      if (isClient) {
        gsap.killTweensOf(marqueeContentRef.current);
      }
    };
  }, [isClient]);

  // GSAP animation for dropdown - hanya jalan di client
  useEffect(() => {
    if (dropdownRef.current && isClient) {
      if (showPembukaDropdown) {
        gsap.fromTo(
          dropdownRef.current,
          { 
            opacity: 0, 
            height: 0,
            y: -10
          },
          { 
            opacity: 1, 
            height: "auto",
            y: 0,
            duration: 0.3, 
            ease: "power2.out"
          }
        );
      } else {
        gsap.to(dropdownRef.current, {
          opacity: 0,
          height: 0,
          y: -10,
          duration: 0.2,
          ease: "power2.in"
        });
      }
    }
  }, [showPembukaDropdown, isClient]);

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

  // Format tanggal dan waktu - hanya dipanggil saat isClient true
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Data navigasi dengan dropdown untuk pembuka
  const navItems = [
    { 
      id: "pembuka", 
      title: "PEMBUKA",
      hasDropdown: true,
      dropdownItems: [
        { id: "salam", title: "SALAM PEMBUKA" },
        { id: "tentang", title: "TENTANG MENURU" },
        { id: "visi-misi", title: "VISI & MISI" },
        { id: "fitur-utama", title: "FITUR UTAMA" },
        { id: "penutup", title: "PENUTUP" }
      ]
    },
    { id: "arsitektur", title: "ARSITEKTUR" },
    { id: "instalasi", title: "INSTALASI" },
    { id: "penggunaan", title: "PENGGUNAAN" },
    { id: "keamanan", title: "KEAMANAN" },
    { id: "troubleshoot", title: "TROUBLESHOOT" }
  ];

  // Data konten yang diperkaya dan detail
  const contentData = {
    salam: {
      title: "SALAM PEMBUKA",
      content: {
        intro: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
        sapaan: "Selamat datang di platform MENURU Solusi digital masa depan untuk kebutuhan literasi dan dokumentasi Anda",
        filosofi: "MENURU berasal dari bahasa Sansekerta yang berarti cahaya pencerahan Sesuai dengan namanya platform ini hadir untuk menerangi perjalanan digital Anda melalui pengalaman membaca dan menulis yang bermakna",
        pesan: "Kami percaya bahwa setiap kata memiliki kekuatan untuk mengubah dunia Melalui MENURU kami mengajak Anda untuk menuliskan cerita berbagi pengetahuan dan menciptakan perubahan"
      }
    },
    tentang: {
      title: "TENTANG MENURU",
      content: {
        sejarah: "MENURU didirikan pada tahun 2023 oleh sekelompok pengembang dan penulis yang peduli akan masa depan literasi digital Berawal dari keprihatinan terhadap minimnya platform baca tulis yang nyaman dan berfokus pada pengalaman pengguna",
        misi: "Menciptakan ekosistem digital yang mendukung pertumbuhan literasi dan kreativitas melalui teknologi yang manusiawi dan mudah diakses",
        keunikan: "Berbeda dari platform lain MENURU mengedepankan pengalaman membaca tanpa gangguan dengan desain minimalis performa cepat dan fitur kolaborasi yang intuitif",
        target: "Platform ini ditujukan untuk penulis akademisi pelajar dan siapa saja yang mencintai dunia tulis menulis"
      }
    },
    "visi-misi": {
      title: "VISI & MISI",
      content: {
        visi: "Menjadi platform literasi digital terdepan yang memberdayakan jutaan penulis dan pembaca di seluruh dunia untuk menciptakan dan membagikan pengetahuan",
        misiList: [
          "Menyediakan platform baca tulis yang nyaman dan bebas gangguan",
          "Membangun komunitas penulis dan pembaca yang aktif dan suportif",
          "Mengembangkan teknologi yang memudahkan proses kreatif menulis",
          "Melestarikan dan mengembangkan literasi dalam format digital",
          "Menciptakan ruang aman bagi kebebasan berekspresi dan berpendapat"
        ],
        nilai: "Transparansi Inovasi Kolaborasi dan Keberlanjutan"
      }
    },
    "fitur-utama": {
      title: "FITUR UTAMA",
      content: {
        daftar: [
          {
            nama: "Mode Membaca Tenang",
            deskripsi: "Antarmuka bebas gangguan dengan opsi kustomisasi font ukuran teks dan tema yang dapat disesuaikan"
          },
          {
            nama: "Editor Kaya Fitur",
            deskripsi: "Markdown editor dengan preview real-time support gambar tabel dan embed konten multimedia"
          },
          {
            nama: "Sistem Koleksi",
            deskripsi: "Atur tulisan Anda dalam koleksi dan rak buku virtual yang rapi dan mudah dinavigasi"
          },
          {
            nama: "Kolaborasi Tim",
            deskripsi: "Fitur kolaborasi real-time untuk menulis bersama dengan kontrol akses dan versi histori"
          },
          {
            nama: "Analitik Membaca",
            deskripsi: "Pantau statistik pembaca waktu baca dan engagement untuk setiap tulisan"
          },
          {
            nama: "Sinkronasi Lintas Platform",
            deskripsi: "Akses tulisan Anda dari berbagai perangkat dengan sinkronasi otomatis via cloud"
          }
        ],
        teknologi: "React Next.js TailwindCSS Prisma PostgreSQL Redis WebSocket"
      }
    },
    penutup: {
      title: "PENUTUP",
      content: {
        terimaKasih: "Terima kasih telah menggunakan platform MENURU Kami berkomitmen untuk terus meningkatkan layanan dan memberikan pengalaman terbaik bagi Anda",
        kontak: "Untuk pertanyaan saran atau kolaborasi hubungi kami di",
        email: "hello@menuru.com",
        sosial: "menuru Twitter Instagram LinkedIn",
        website: "www.menuru.com",
        penutup: "Wassalamu'alaikum Warahmatullahi Wabarakatuh"
      }
    },
    arsitektur: {
      title: "ARSITEKTUR",
      content: {
        overview: "Platform MENURU dibangun dengan arsitektur microservices yang scalable dan resilient dirancang untuk menangani jutaan pengguna aktif dengan latensi minimal",
        stack: {
          frontend: "Next.js 14 dengan App Router TypeScript TailwindCSS Framer Motion untuk animasi halus dan GSAP untuk interaksi kompleks",
          backend: "Node.js dengan Express GraphQL API WebSocket untuk real-time updates dan Redis untuk caching",
          database: "PostgreSQL untuk data utama MongoDB untuk konten tidak terstruktur Elasticsearch untuk pencarian full-text",
          infrastructure: "Docker container Kubernetes orchestration AWS cloud CloudFront CDN dan multiple availability zones"
        },
        scalability: "Arsitektur horizontal scaling dengan load balancing otomatis dan database sharding untuk menangani pertumbuhan data eksponensial",
        performance: "Optimasi dengan server-side rendering static generation incremental static regeneration dan edge computing untuk response time di bawah 100ms"
      }
    },
    instalasi: {
      title: "INSTALASI",
      content: {
        requirements: {
          hardware: "CPU 2 core minimum RAM 4GB minimum Storage 20GB available",
          software: "Node.js 18+ PostgreSQL 14+ Redis 6+ Docker 20+ opsional",
          os: "Linux Ubuntu 20.04+ Debian 11+ macOS 12+ Windows 11 dengan WSL2"
        },
        steps: [
          {
            title: "Clone Repository",
            code: "git clone https://github.com/menuru/platform.git cd platform"
          },
          {
            title: "Install Dependencies",
            code: "npm install atau yarn install"
          },
          {
            title: "Konfigurasi Environment",
            code: "cp .env.example .env Edit file .env sesuai konfigurasi Anda"
          },
          {
            title: "Setup Database",
            code: "npx prisma migrate dev npm run seed"
          },
          {
            title: "Build dan Jalankan",
            code: "npm run build npm start"
          }
        ],
        docker: "Untuk deployment dengan Docker docker-compose up -d",
        verification: "Akses http://localhost:3000 untuk verifikasi instalasi berhasil"
      }
    },
    penggunaan: {
      title: "PENGGUNAAN",
      content: {
        panduan: [
          {
            judul: "Memulai Menulis",
            langkah: [
              "Klik tombol Tulis Baru di dashboard",
              "Pilih template atau mulai dari kosong",
              "Gunakan editor markdown untuk memformat teks",
              "Tambahkan gambar dengan drag-and-drop",
              "Atur kategori dan tag untuk organisasi"
            ]
          },
          {
            judul: "Mengelola Koleksi",
            langkah: [
              "Buat koleksi baru dari sidebar",
              "Seret tulisan ke dalam koleksi",
              "Atur urutan dengan drag-and-drop",
              "Bagikan koleksi dengan pengguna lain"
            ]
          },
          {
            judul: "Kolaborasi Tim",
            langkah: [
              "Undang anggota tim via email",
              "Atur role admin editor viewer",
              "Lihat perubahan real-time",
              "Gunakan komentar untuk diskusi"
            ]
          }
        ],
        shortcut: [
          { keys: "Ctrl Cmd + K", fungsi: "Pencarian cepat" },
          { keys: "Ctrl Cmd + S", fungsi: "Simpan draft" },
          { keys: "Ctrl Cmd + P", fungsi: "Preview mode" },
          { keys: "Ctrl Cmd + B", fungsi: "Bold teks" },
          { keys: "Ctrl Cmd + I", fungsi: "Italic teks" }
        ]
      }
    },
    keamanan: {
      title: "KEAMANAN",
      content: {
        enkripsi: "Semua data dienkripsi end-to-end menggunakan AES-256 untuk data at-rest dan TLS 1.3 untuk data in-transit",
        authentication: "Multi-factor authentication MFA dengan dukungan authenticator apps SMS dan email verification Single Sign-On SSO untuk enterprise",
        authorization: "Role-based access control RBAC dengan 5 level akses Super Admin Admin Editor Contributor Viewer",
        privacy: "GDPR dan CCPA compliant dengan fitur data export dan penghapusan data permanen",
        monitoring: "24/7 real-time monitoring dengan anomaly detection dan automated threat response",
        compliance: "ISO 27001 certified SOC 2 Type II dan HIPAA compliant untuk sektor healthcare"
      }
    },
    troubleshoot: {
      title: "TROUBLESHOOT",
      content: {
        umum: [
          {
            masalah: "Halaman tidak loading",
            solusi: "Clear cache browser cek koneksi internet pastikan tidak ada firewall blocking"
          },
          {
            masalah: "Login gagal",
            solusi: "Reset password cek email verification pastikan caps lock non aktif"
          },
          {
            masalah: "Perubahan tidak tersimpan",
            solusi: "Cek koneksi internet refresh halaman cek storage quota"
          }
        ],
        error: [
          {
            kode: "ERR 401",
            deskripsi: "Unauthorized access",
            solusi: "Login ulang refresh token cek session expiry"
          },
          {
            kode: "ERR 403",
            deskripsi: "Forbidden resource",
            solusi: "Minta akses ke admin cek permission settings"
          },
          {
            kode: "ERR 429",
            deskripsi: "Rate limit exceeded",
            solusi: "Tunggu beberapa menit kurangi frekuensi request"
          }
        ],
        kontak: "Jika masalah berlanjut hubungi support di support@menuru.com atau melalui live chat 24/7"
      }
    }
  };

  // Semua author adalah Farid Ardiansyah
  const authors = {
    salam: { name: "Farid Ardiansyah", role: "Lead Documentation" },
    tentang: { name: "Farid Ardiansyah", role: "Lead Documentation" },
    "visi-misi": { name: "Farid Ardiansyah", role: "Lead Documentation" },
    "fitur-utama": { name: "Farid Ardiansyah", role: "Lead Documentation" },
    penutup: { name: "Farid Ardiansyah", role: "Lead Documentation" },
    arsitektur: { name: "Farid Ardiansyah", role: "Lead Documentation" },
    instalasi: { name: "Farid Ardiansyah", role: "Lead Documentation" },
    penggunaan: { name: "Farid Ardiansyah", role: "Lead Documentation" },
    keamanan: { name: "Farid Ardiansyah", role: "Lead Documentation" },
    troubleshoot: { name: "Farid Ardiansyah", role: "Lead Documentation" }
  };

  const getCurrentAuthor = () => {
    if (activeSection === "pembuka") {
      return authors[activeSubSection as keyof typeof authors] || authors.salam;
    }
    return authors[activeSection as keyof typeof authors] || authors.arsitektur;
  };

  const getCurrentContent = () => {
    if (activeSection === "pembuka") {
      return contentData[activeSubSection as keyof typeof contentData] || contentData.salam;
    }
    return contentData[activeSection as keyof typeof contentData];
  };

  const currentContent = getCurrentContent();
  const currentAuthor = getCurrentAuthor();

  const ArrowIcon = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        marginLeft: '1rem',
        marginRight: '1rem',
        opacity: 0.8,
        color: 'white'
      }}
    >
      <path 
        d="M7 17L17 7M17 7H8M17 7V16" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  const PlusIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transition: 'transform 0.3s ease',
        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        color: 'white',
        opacity: 0.6
      }}
    >
      <path 
        d="M12 5V19M5 12H19" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );

  const renderContent = () => {
    const content = currentContent.content;
    
    if (typeof content === 'string') {
      return <div style={{ fontSize: '1.15rem', lineHeight: 1.7, opacity: 0.9, color: 'white' }}>{content}</div>;
    }

    return (
      <div style={{ fontSize: '1.15rem', lineHeight: 1.7, opacity: 0.9, color: 'white' }}>
        {Object.entries(content).map(([key, value]) => {
          if (key === 'title') return null;
          
          if (Array.isArray(value)) {
            if (value[0]?.nama) { // Fitur utama
              return (
                <div key={key} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', opacity: 1, color: 'white' }}>
                    {key === 'daftar' ? 'Daftar Fitur' : key}
                  </h3>
                  {value.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '1.5rem', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>{item.nama}</div>
                      <div style={{ opacity: 0.8, color: 'white' }}>{item.deskripsi}</div>
                    </div>
                  ))}
                </div>
              );
            }
            
            if (value[0]?.judul) { // Penggunaan
              return (
                <div key={key} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', opacity: 1, color: 'white' }}>
                    {key === 'panduan' ? 'Panduan Penggunaan' : key}
                  </h3>
                  {value.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '2rem' }}>
                      <div style={{ fontWeight: '600', marginBottom: '1rem', color: 'white' }}>{item.judul}</div>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {item.langkah?.map((langkah: string, lidx: number) => (
                          <li key={lidx} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ marginRight: '1rem', opacity: 0.5, color: 'white' }}>{lidx + 1}</span>
                            <span style={{ color: 'white' }}>{langkah}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            }
            
            if (value[0]?.keys) { // Shortcut
              return (
                <div key={key} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', opacity: 1, color: 'white' }}>Keyboard Shortcuts</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {value.map((item, idx) => (
                      <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <code style={{ color: 'white', fontWeight: '600' }}>{item.keys}</code>
                        <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.25rem', color: 'white' }}>{item.fungsi}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            if (value[0]?.masalah) { // Troubleshoot umum
              return (
                <div key={key} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', opacity: 1, color: 'white' }}>Masalah Umum</h3>
                  {value.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', color: '#ff6b6b', marginBottom: '0.5rem' }}>{item.masalah}</div>
                      <div style={{ opacity: 0.8, color: 'white' }}>Solusi {item.solusi}</div>
                    </div>
                  ))}
                </div>
              );
            }
            
            if (value[0]?.kode) { // Error codes
              return (
                <div key={key} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', opacity: 1, color: 'white' }}>Kode Error</h3>
                  {value.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <code style={{ color: '#ffd700', fontWeight: '600' }}>{item.kode}</code>
                      <div style={{ marginTop: '0.5rem', opacity: 0.9, color: 'white' }}>{item.deskripsi}</div>
                      <div style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: '0.95rem', color: 'white' }}>Solusi {item.solusi}</div>
                    </div>
                  ))}
                </div>
              );
            }
            
            // Default array rendering
            return (
              <div key={key} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', opacity: 1, color: 'white' }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {value.map((item: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ marginRight: '1rem', opacity: 0.5, color: 'white' }}></span>
                      <span style={{ color: 'white' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          
          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', opacity: 1, color: 'white', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h3>
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '500', opacity: 0.9, marginBottom: '0.5rem', color: 'white', textTransform: 'capitalize' }}>
                      {subKey.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div style={{ opacity: 0.8, marginLeft: '1rem', color: 'white' }}>{String(subValue)}</div>
                  </div>
                ))}
              </div>
            );
          }
          
          // Simple key-value
          return (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: '500', color: 'white', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')} </span>
              <span style={{ color: 'white' }}>{String(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

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
      cursor: 'default',
      overflow: 'hidden'
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
        flexDirection: 'column'
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: '800',
          marginBottom: '2.5rem',
          lineHeight: 1,
          opacity: 0.9,
          letterSpacing: '-0.5px',
          color: 'white'
        }}>
          MENURU
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.1rem',
          overflowY: 'auto',
          flex: 1
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
                  fontSize: '1rem',
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
                  borderRadius: '4px',
                  color: 'white'
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
                  <PlusIcon isOpen={showPembukaDropdown && item.id === "pembuka"} />
                )}
              </div>
              
              {/* Dropdown untuk Pembuka dengan GSAP */}
              {item.id === "pembuka" && (
                <div
                  ref={dropdownRef}
                  style={{
                    position: 'relative',
                    paddingLeft: '1rem',
                    marginTop: '0.1rem',
                    opacity: 0,
                    height: 0,
                    overflow: 'hidden'
                  }}
                >
                  {item.dropdownItems?.map((dropdownItem) => (
                    <div
                      key={dropdownItem.id}
                      onClick={() => {
                        setActiveSubSection(dropdownItem.id);
                        setActiveSection("pembuka");
                        setShowPembukaDropdown(false);
                      }}
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: activeSubSection === dropdownItem.id ? '600' : '400',
                        cursor: 'pointer',
                        padding: '0.5rem 0.5rem 0.5rem 1rem',
                        opacity: activeSubSection === dropdownItem.id ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.5px',
                        lineHeight: '1.2',
                        backgroundColor: activeSubSection === dropdownItem.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                        borderLeft: activeSubSection === dropdownItem.id ? '2px solid white' : '2px solid transparent',
                        borderRadius: '0 4px 4px 0',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        if (activeSubSection !== dropdownItem.id) {
                          e.currentTarget.style.opacity = '0.9';
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeSubSection !== dropdownItem.id) {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {dropdownItem.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: '280px',
        flex: 1,
        padding: '4rem 3rem 4rem 6rem',
        minHeight: '100vh',
        marginRight: '2rem',
        position: 'relative',
        width: 'calc(100% - 280px)'
      }}>
        
        {/* Marquee Text dengan Panah */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: '280px',
          right: 0,
          zIndex: 20,
          backgroundColor: 'black',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '0.75rem 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          <div
            ref={marqueeContentRef}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '500',
              letterSpacing: '1px'
            }}
          >
            {/* Konten marquee diulang 4 kali untuk efek infinite */}
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span>DOCS MENURU</span>
                <ArrowIcon />
                <span>DOCUMENTATION</span>
                <ArrowIcon />
                <span>USER GUIDE</span>
                <ArrowIcon />
                <span>TECHNICAL REFERENCE</span>
                <ArrowIcon />
                <span>API DOCS</span>
                <ArrowIcon />
              </div>
            ))}
          </div>
        </div>

        {/* Spacer untuk konten agar tidak tertutup marquee */}
        <div style={{ height: '4rem' }} />

        <div ref={contentRef} style={{ maxWidth: '900px' }}>
          
          {/* Title tanpa tanda pemisah */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: '4.5rem',
              fontWeight: '900',
              lineHeight: 1,
              letterSpacing: '-2px',
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
              color: 'white'
            }}
          >
            {currentContent.title}
          </motion.div>

          {/* Author dan Info Update Real-time - Hanya tampil di client */}
          {isClient && currentDateTime && (
            <div style={{
              paddingLeft: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span style={{ opacity: 0.8, fontSize: '0.95rem' }}>{currentAuthor.name}</span>
                <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>({currentAuthor.role})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ opacity: 0.8, fontSize: '0.95rem' }}>Terakhir diperbarui</span>
                <span style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: '500' }}>{formatDate(currentDateTime)}</span>
                <span style={{ opacity: 0.7, fontSize: '0.95rem' }}>{formatTime(currentDateTime)} WIB</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{
            paddingLeft: '1.5rem',
            paddingRight: '2rem'
          }}>
            {renderContent()}
          </div>

          {/* Footer dengan informasi lengkap - Hanya tampil di client */}
          {isClient && currentDateTime && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                maxWidth: '800px',
                paddingLeft: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '2rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.4, marginBottom: '0.5rem', color: 'white' }}>VERSION</div>
                <div style={{ fontSize: '0.95rem', opacity: 0.8, color: 'white' }}>2.0.0</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.4, marginBottom: '0.5rem', color: 'white' }}>LAST UPDATE</div>
                <div style={{ fontSize: '0.95rem', opacity: 0.8, color: 'white' }}>{formatDate(currentDateTime)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.4, marginBottom: '0.5rem', color: 'white' }}>AUTHOR</div>
                <div style={{ fontSize: '0.95rem', opacity: 0.8, color: 'white' }}>{currentAuthor.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.4, marginBottom: '0.5rem', color: 'white' }}>BUILD</div>
                <div style={{ fontSize: '0.95rem', opacity: 0.8, color: 'white' }}>Production</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
