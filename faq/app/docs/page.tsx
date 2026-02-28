'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [activeSubSection, setActiveSubSection] = useState("pengantar");
  const [showPembukaDropdown, setShowPembukaDropdown] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  // GSAP animation for marquee
  useEffect(() => {
    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, {
        x: "-100%",
        duration: 25,
        repeat: -1,
        ease: "none"
      });
    }
  }, []);

  useEffect(() => {
    // GSAP animation for content
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
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

  // Arrow SVG Icon
  const ArrowIcon = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        display: 'inline-block', 
        margin: '0 12px',
        opacity: 0.5,
        transform: 'rotate(-45deg)'
      }}
    >
      <path 
        d="M7 17L17 7M17 7H8M17 7V16" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  // Navigation Icons
  const navIcons = {
    pembuka: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4L20 4M4 12L20 12M4 20L20 20" strokeLinecap="round"/>
      </svg>
    ),
    arsitektur: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21L21 3M9 21L21 9M15 21L21 15M3 15L15 3M3 9L9 3" strokeLinecap="round"/>
      </svg>
    ),
    instalasi: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8L12 3L20 8L12 13L4 8Z M4 14L12 19L20 14" strokeLinecap="round"/>
      </svg>
    ),
    penggunaan: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4" strokeLinecap="round"/>
      </svg>
    ),
    keamanan: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3L20 7V12C20 16 16 20 12 20C8 20 4 16 4 12V7L12 3Z" strokeLinecap="round"/>
      </svg>
    ),
    troubleshoot: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 8V12M12 16H12.01" strokeLinecap="round"/>
      </svg>
    ),
    fitur: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="8" height="8" rx="1"/>
        <rect x="13" y="3" width="8" height="8" rx="1"/>
        <rect x="3" y="13" width="8" height="8" rx="1"/>
        <rect x="13" y="13" width="8" height="8" rx="1"/>
      </svg>
    ),
    api: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4H20V20H4V4Z" strokeLinecap="round"/>
        <path d="M8 8H16V16H8V8Z" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="1" fill="white"/>
      </svg>
    ),
    faq: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 16V12M12 8H12.01" strokeLinecap="round"/>
      </svg>
    )
  };

  // Data navigasi dengan dropdown untuk pembuka
  const navItems = [
    { 
      id: "pembuka", 
      title: "PEMBUKA",
      icon: navIcons.pembuka,
      hasDropdown: true,
      dropdownItems: [
        { id: "pengantar", title: "PENGANTAR" },
        { id: "tentang", title: "TENTANG" },
        { id: "sejarah", title: "SEJARAH" },
        { id: "visi", title: "VISI" },
        { id: "misi", title: "MISI" },
        { id: "filosofi", title: "FILOSOFI" },
        { id: "tim", title: "TIM PENGEMBANG" },
        { id: "penutup", title: "PENUTUP" }
      ]
    },
    { id: "arsitektur", title: "ARSITEKTUR", icon: navIcons.arsitektur },
    { id: "instalasi", title: "INSTALASI", icon: navIcons.instalasi },
    { id: "penggunaan", title: "PENGGUNAAN", icon: navIcons.penggunaan },
    { id: "fitur", title: "FITUR", icon: navIcons.fitur },
    { id: "api", title: "API", icon: navIcons.api },
    { id: "keamanan", title: "KEAMANAN", icon: navIcons.keamanan },
    { id: "troubleshoot", title: "TROUBLESHOOT", icon: navIcons.troubleshoot },
    { id: "faq", title: "FAQ", icon: navIcons.faq }
  ];

  // Data konten lengkap - Minimalist dengan banyak konten
  const contentData = {
    pembuka: {
      title: "PEMBUKA",
      sections: {
        pengantar: {
          title: "PENGANTAR",
          paragraphs: [
            "Selamat datang di dokumentasi platform MENURU. Dokumentasi ini disusun untuk memberikan pemahaman komprehensif tentang penggunaan dan pengembangan platform.",
            "MENURU adalah platform dokumentasi modern yang dirancang untuk memudahkan tim dalam membuat, mengelola, dan mendistribusikan dokumentasi secara efisien.",
            "Dokumentasi ini mencakup seluruh aspek platform, mulai dari konsep dasar hingga implementasi teknis lanjutan."
          ]
        },
        tentang: {
          title: "TENTANG MENURU",
          paragraphs: [
            "MENURU lahir dari kebutuhan akan platform dokumentasi yang sederhana namun powerful. Nama MENURU berasal dari bahasa Sansekerta yang berarti 'panduan' atau 'petunjuk'.",
            "Platform ini dikembangkan dengan filosofi bahwa dokumentasi yang baik harus mudah diakses, mudah dipahami, dan mudah dikelola.",
            "Dengan MENURU, tim dapat berkolaborasi dalam membuat dokumentasi, melacak perubahan, dan mempublikasikan konten dengan workflow yang terstruktur."
          ]
        },
        sejarah: {
          title: "SEJARAH",
          content: [
            {
              tahun: "2022 - IDE AWAL",
              desc: "Konsep MENURU pertama kali dicetuskan oleh tim developer yang frustrasi dengan tools dokumentasi yang ada."
            },
            {
              tahun: "2023 - PROTOTYPE",
              desc: "Versi pertama MENURU dikembangkan sebagai proyek internal, digunakan oleh 3 tim pengembang."
            },
            {
              tahun: "2023 - BETA",
              desc: "Program beta diluncurkan dengan 50 perusahaan, mendapatkan feedback positif untuk pengembangan."
            },
            {
              tahun: "2024 - LAUNCH",
              desc: "MENURU versi 1.0 dirilis secara publik dengan fitur dasar manajemen dokumentasi."
            },
            {
              tahun: "2024 - VERSI 2.0",
              desc: "Pembaruan besar dengan fitur kolaborasi real-time, API publik, dan integrasi pihak ketiga."
            },
            {
              tahun: "2025 - MASA DEPAN",
              desc: "Rencana pengembangan AI-powered documentation, offline mode, dan mobile apps."
            }
          ]
        },
        visi: {
          title: "VISI",
          paragraphs: [
            "Menjadi platform dokumentasi terdepan yang memberdayakan setiap individu dan tim untuk berbagi pengetahuan secara efektif.",
            "Menciptakan ekosistem dokumentasi yang kolaboratif, inklusif, dan berkelanjutan untuk mendukung pertumbuhan pengetahuan kolektif."
          ]
        },
        misi: {
          title: "MISI",
          items: [
            "Menyediakan infrastruktur dokumentasi yang intuitif dan mudah digunakan",
            "Membangun komunitas berbagi pengetahuan yang aktif dan suportif",
            "Terus berinovasi dalam teknologi dokumentasi digital",
            "Menjaga keamanan dan privasi data pengguna",
            "Mendukung berbagai format dan kebutuhan dokumentasi",
            "Memfasilitasi kolaborasi tim tanpa batasan geografis"
          ]
        },
        filosofi: {
          title: "FILOSOFI",
          paragraphs: [
            "Dokumentasi bukan sekadar catatan, melainkan jembatan antara ide dan realisasi, antara pengembang dan pengguna.",
            "Kami percaya bahwa dokumentasi yang baik dapat mengubah cara orang belajar, bekerja, dan berinovasi.",
            "Dengan desain yang sederhana namun fungsional, kami ingin membuat dokumentasi menjadi kegiatan yang menyenangkan, bukan beban."
          ]
        },
        tim: {
          title: "TIM PENGEMBANG",
          members: [
            "Arya Wicaksana - Founder & Lead Developer",
            "Budi Santoso - Backend Architect",
            "Citra Dewi - Frontend Engineer",
            "Dian Pratama - DevOps Specialist",
            "Eka Putri - UI/UX Designer",
            "Farhan Hakim - Security Engineer",
            "Gita Savitri - Documentation Lead",
            "Hadi Wijaya - Quality Assurance"
          ]
        },
        penutup: {
          title: "PENUTUP",
          paragraphs: [
            "Terima kasih telah menggunakan MENURU. Kami berkomitmen untuk terus meningkatkan platform ini berdasarkan masukan dari pengguna.",
            "Dokumentasi ini akan terus diperbarui seiring dengan perkembangan fitur dan peningkatan platform.",
            "Untuk pertanyaan, saran, atau laporan bug, silakan hubungi tim kami melalui email atau forum diskusi."
          ]
        }
      }
    },
    arsitektur: {
      title: "ARSITEKTUR",
      sections: [
        {
          sub: "STRUKTUR DASAR",
          items: [
            "Frontend: Next.js 14 dengan App Router",
            "Backend: Node.js + Express.js",
            "Database: PostgreSQL untuk data utama",
            "Cache: Redis untuk session dan performa",
            "Storage: AWS S3 untuk file media",
            "Queue: BullMQ untuk background jobs",
            "Search: Elasticsearch untuk pencarian"
          ]
        },
        {
          sub: "INFRASTRUKTUR",
          items: [
            "Container: Docker untuk isolasi aplikasi",
            "Orchestration: Kubernetes untuk scaling",
            "Load Balancer: NGINX untuk traffic management",
            "CDN: CloudFront untuk distribusi konten",
            "Monitoring: Prometheus + Grafana",
            "Logging: ELK Stack (Elasticsearch, Logstash, Kibana)",
            "CI/CD: GitHub Actions untuk deployment"
          ]
        },
        {
          sub: "DATA FLOW",
          items: [
            "Client request masuk melalui CDN",
            "Load balancer mendistribusikan ke container",
            "API Gateway mengarahkan ke service yang sesuai",
            "Service memproses dengan data dari database/cache",
            "Response dikirim kembali ke client",
            "Semua aktivitas tercatat di logging system"
          ]
        },
        {
          sub: "KEAMANAN ARSITEKTUR",
          items: [
            "Network isolation dengan VPC",
            "Encryption in transit (TLS 1.3)",
            "Encryption at rest untuk semua data",
            "WAF untuk proteksi dari serangan web",
            "Rate limiting untuk mencegah abuse",
            "Regular security audit dan penetration testing"
          ]
        }
      ]
    },
    instalasi: {
      title: "INSTALASI",
      methods: [
        {
          type: "METODE 1: INSTALASI CEPAT",
          steps: [
            "npx create-menuru-app my-docs",
            "cd my-docs",
            "npm install",
            "cp .env.example .env",
            "npm run dev"
          ]
        },
        {
          type: "METODE 2: MANUAL",
          steps: [
            "git clone https://github.com/menuru/platform.git",
            "cd platform",
            "npm install",
            "npm run build",
            "npm start"
          ]
        },
        {
          type: "METODE 3: DOCKER",
          steps: [
            "docker pull menuru/platform:latest",
            "docker run -p 3000:3000 menuru/platform",
            "# atau menggunakan docker-compose",
            "wget https://menuru.com/docker-compose.yml",
            "docker-compose up -d"
          ]
        },
        {
          type: "METODE 4: PRODUCTION",
          steps: [
            "npm run build",
            "npm run migrate:up",
            "npm run seed:initial",
            "pm2 start ecosystem.config.js",
            "nginx -t && systemctl restart nginx"
          ]
        }
      ],
      requirements: [
        "Node.js 18.0 atau lebih baru",
        "PostgreSQL 14 atau lebih baru",
        "Redis 6 atau lebih baru (opsional)",
        "4GB RAM minimum, 8GB recommended",
        "20GB storage untuk aplikasi"
      ]
    },
    penggunaan: {
      title: "PENGGUNAAN",
      categories: [
        {
          name: "DASAR",
          items: [
            "Membuat workspace baru",
            "Mengundang anggota tim",
            "Membuat halaman dokumentasi",
            "Mengedit konten dengan editor",
            "Menambahkan gambar dan file",
            "Mempublikasikan perubahan"
          ]
        },
        {
          name: "MENENGAH",
          items: [
            "Mengatur struktur navigasi",
            "Menggunakan template",
            "Membuat versi dokumentasi",
            "Mengatur permission pengguna",
            "Integrasi dengan Git",
            "Export ke PDF/Markdown"
          ]
        },
        {
          name: "LANJUTAN",
          items: [
            "Custom domain setup",
            "API integration",
            "Webhook configuration",
            "Custom styling dengan CSS",
            "Analytics dashboard",
            "Backup dan restore"
          ]
        },
        {
          name: "KOLABORASI",
          items: [
            "Real-time editing",
            "Comments dan mentions",
            "Review dan approval workflow",
            "Activity logs",
            "Team notifications",
            "Version comparison"
          ]
        }
      ],
      shortcuts: [
        "Cmd/Ctrl + K - Buka command palette",
        "Cmd/Ctrl + S - Simpan dokumen",
        "Cmd/Ctrl + F - Pencarian",
        "Cmd/Ctrl + B - Toggle sidebar",
        "Cmd/Ctrl + P - Print preview",
        "Cmd/Ctrl + Z - Undo",
        "Cmd/Ctrl + Shift + Z - Redo",
        "Cmd/Ctrl + / - Keyboard shortcuts"
      ]
    },
    fitur: {
      title: "FITUR",
      list: [
        {
          group: "EDITOR",
          features: [
            "Rich text editor dengan formatting lengkap",
            "Markdown support dengan preview real-time",
            "Code syntax highlighting untuk 100+ bahasa",
            "Drag-and-drop image upload",
            "Table editor dengan styling",
            "Link manager untuk internal references",
            "Emoji picker dan special characters",
            "Math equations dengan LaTeX support"
          ]
        },
        {
          group: "MANAJEMEN",
          features: [
            "Folder organization dengan nested structure",
            "Tagging system untuk kategorisasi",
            "Search dengan filter advanced",
            "Bulk operations untuk multiple files",
            "Archive dan restore system",
            "Version history dengan diff view",
            "Template library dengan 50+ template",
            "Import dari berbagai format (DOCX, MD, HTML)"
          ]
        },
        {
          group: "KOLABORASI",
          features: [
            "Multi-user editing real-time",
            "Inline comments dan discussions",
            "User mentions dengan notifikasi",
            "Review workflow dengan approval",
            "Activity timeline untuk setiap dokumen",
            "Team spaces dengan custom permissions",
            "Shared drafts dan publishing queue",
            "User presence indicator"
          ]
        },
        {
          group: "INTEGRASI",
          features: [
            "Slack integration untuk notifikasi",
            "GitHub/GitLab sync",
            "Jira integration untuk issue tracking",
            "Confluence migration tools",
            "Zapier connect untuk 1000+ apps",
            "Custom webhooks untuk events",
            "REST API dengan rate limiting",
            "OAuth 2.0 untuk authentication"
          ]
        },
        {
          group: "ANALYTICS",
          features: [
            "Page views dan unique visitors",
            "User engagement metrics",
            "Search analytics dan popular queries",
            "Document performance dashboard",
            "Team activity reports",
            "Export analytics ke CSV/Excel",
            "Custom date range filtering",
            "Real-time visitor monitoring"
          ]
        },
        {
          group: "KUSTOMISASI",
          features: [
            "Custom themes dengan CSS",
            "Branding dengan logo perusahaan",
            "Custom domain dengan SSL",
            "Landing page builder",
            "Email templates untuk notifikasi",
            "Custom error pages",
            "Favicon dan meta tags",
            "Social media preview"
          ]
        }
      ]
    },
    api: {
      title: "API",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/documents",
          desc: "Mendapatkan daftar semua dokumen",
          params: "page, limit, search, sort, filter"
        },
        {
          method: "GET",
          path: "/api/v1/documents/:id",
          desc: "Mendapatkan detail dokumen spesifik",
          params: "include=versions,comments"
        },
        {
          method: "POST",
          path: "/api/v1/documents",
          desc: "Membuat dokumen baru",
          body: "title, content, folder_id, tags[]"
        },
        {
          method: "PUT",
          path: "/api/v1/documents/:id",
          desc: "Mengupdate dokumen existing",
          body: "title, content, tags[]"
        },
        {
          method: "DELETE",
          path: "/api/v1/documents/:id",
          desc: "Menghapus dokumen",
          params: "permanent=false (soft delete)"
        },
        {
          method: "POST",
          path: "/api/v1/documents/:id/restore",
          desc: "Mengembalikan dokumen yang dihapus"
        },
        {
          method: "GET",
          path: "/api/v1/folders",
          desc: "Mendapatkan struktur folder"
        },
        {
          method: "GET",
          path: "/api/v1/search",
          desc: "Pencarian dokumen",
          params: "q, type, folder_id, tags"
        },
        {
          method: "GET",
          path: "/api/v1/users",
          desc: "Daftar pengguna dalam workspace"
        },
        {
          method: "POST",
          path: "/api/v1/invitations",
          desc: "Mengundang pengguna baru"
        }
      ],
      auth: "Bearer token authentication via Authorization header",
      rateLimit: "1000 requests per hour untuk free tier, 10000 untuk pro",
      versions: "v1 (stable), v2 (beta) available 2025"
    },
    keamanan: {
      title: "KEAMANAN",
      categories: [
        {
          name: "ENKRIPSI",
          items: [
            "TLS 1.3 untuk semua koneksi",
            "AES-256 untuk data at rest",
            "End-to-end encryption untuk data sensitif",
            "Secure key management dengan HSM",
            "Perfect forward secrecy untuk session"
          ]
        },
        {
          name: "AUTENTIKASI",
          items: [
            "Multi-factor authentication (MFA)",
            "Single Sign-On (SSO) dengan SAML",
            "OAuth 2.0 / OpenID Connect",
            "Passwordless login options",
            "Session management dengan timeout",
            "Brute force protection"
          ]
        },
        {
          name: "AUTORISASI",
          items: [
            "Role-based access control (RBAC)",
            "Granular permissions per dokumen",
            "IP whitelisting untuk admin",
            "Time-based access restrictions",
            "Audit logs untuk semua akses",
            "Data isolation per workspace"
          ]
        },
        {
          name: "COMPLIANCE",
          items: [
            "GDPR compliance untuk Eropa",
            "HIPAA readiness untuk healthcare",
            "SOC 2 Type II certified",
            "ISO 27001 certified",
            "Data residency options",
            "Regular third-party audits"
          ]
        },
        {
          name: "MONITORING",
          items: [
            "Real-time security alerts",
            "Intrusion detection system (IDS)",
            "DDoS protection",
            "WAF dengan OWASP rules",
            "Vulnerability scanning",
            "Penetration testing quarterly"
          ]
        }
      ]
    },
    troubleshoot: {
      title: "TROUBLESHOOT",
      issues: [
        {
          problem: "Tidak bisa login",
          causes: [
            "Password salah - reset melalui email",
            "Akun belum diverifikasi - cek email verifikasi",
            "Terlalu banyak percobaan - tunggu 15 menit",
            "Session expired - login ulang",
            "2FA code salah - pastikan waktu sinkron"
          ]
        },
        {
          problem: "Halaman lambat",
          causes: [
            "Koneksi internet - cek speed test",
            "Cache browser - clear cache",
            "Terlalu banyak konten - split menjadi beberapa halaman",
            "Gambar besar - kompres sebelum upload",
            "Server sibuk - coba beberapa saat lagi"
          ]
        },
        {
          problem: "Upload gagal",
          causes: [
            "File terlalu besar - max 100MB",
            "Format tidak didukung - gunakan JPG, PNG, PDF",
            "Storage quota penuh - upgrade paket",
            "Network timeout - coba file lebih kecil",
            "Permission denied - cek role user"
          ]
        },
        {
          problem: "Notifikasi tidak masuk",
          causes: [
            "Email settings - cek spam folder",
            "Browser notifications - cek permission",
            "Do not disturb mode - matikan DND",
            "Wrong email address - update profile",
            "Notification settings - cek preferences"
          ]
        },
        {
          problem: "Search tidak akurat",
          causes: [
            "Index belum update - tunggu beberapa menit",
            "Search terms terlalu umum - gunakan kata spesifik",
            "Filter terlalu ketat - perluas filter",
            "Content tidak dipublikasikan - cek status",
            "Permission terbatas - tidak bisa melihat semua hasil"
          ]
        },
        {
          problem: "Export error",
          causes: [
            "File terlalu besar - export per section",
            "Format tidak support - gunakan format lain",
            "Memory limit - tutup tab lain",
            "Server timeout - coba di jam sepi",
            "Character encoding - gunakan UTF-8"
          ]
        }
      ]
    },
    faq: {
      title: "FAQ",
      questions: [
        {
          q: "Apa itu MENURU?",
          a: "MENURU adalah platform dokumentasi modern untuk tim, memudahkan pembuatan dan pengelolaan dokumentasi secara kolaboratif."
        },
        {
          q: "Berapa biaya berlangganan?",
          a: "Tersedia free tier dengan 5 user dan 100 dokumen. Paket Pro mulai $15/user/bulan, Enterprise hubungi sales."
        },
        {
          q: "Bagaimana cara migrasi dari platform lain?",
          a: "Kami menyediakan tools migrasi untuk Confluence, Notion, GitBook, dan Markdown files. Dokumentasi tersedia di halaman migrasi."
        },
        {
          q: "Apakah data saya aman?",
          a: "Ya, semua data dienkripsi dengan standar industri. Kami memiliki sertifikasi ISO 27001 dan SOC 2 Type II."
        },
        {
          q: "Bisa akses offline?",
          a: "Saat ini belum, namun fitur offline mode sedang dalam pengembangan dan direncanakan rilis Q3 2025."
        },
        {
          q: "Bagaimana cara backup data?",
          a: "Backup otomatis dilakukan setiap 6 jam dan disimpan selama 30 hari. Ekspor manual juga tersedia."
        },
        {
          q: "Support bahasa apa saja?",
          a: "UI tersedia dalam Bahasa Indonesia dan Inggris. Editor mendukung semua bahasa untuk konten."
        },
        {
          q: "Ada limitasi jumlah dokumen?",
          a: "Free tier: 100 dokumen, Pro: unlimited, Enterprise: unlimited dengan storage tambahan."
        },
        {
          q: "Bisa custom domain?",
          a: "Ya, fitur custom domain tersedia untuk paket Pro dan Enterprise dengan konfigurasi SSL otomatis."
        },
        {
          q: "Bagaimana cara menghapus akun?",
          a: "Masuk ke Settings > Account > Delete Account. Data akan dihapus permanen dalam 30 hari."
        },
        {
          q: "Support untuk tim besar?",
          a: "Enterprise plan mendukung unlimited user dengan SSO, advanced permissions, dan dedicated support."
        },
        {
          q: "Ada mobile app?",
          a: "Saat ini website sudah responsive. Mobile apps untuk iOS dan Android sedang dikembangkan."
        },
        {
          q: "Bisa integrasi dengan tools lain?",
          a: "Ya, melalui REST API, webhooks, atau integrasi langsung dengan Slack, GitHub, Jira, dan lainnya."
        },
        {
          q: "Bagaimana cara report bug?",
          a: "Kirim email ke support@menuru.com atau gunakan fitur feedback di dashboard."
        }
      ]
    }
  };

  // Mendapatkan konten berdasarkan section aktif
  const getCurrentContent = () => {
    if (activeSection === "pembuka") {
      return contentData.pembuka.sections[activeSubSection as keyof typeof contentData.pembuka.sections];
    }
    return contentData[activeSection as keyof typeof contentData];
  };

  const currentContent = getCurrentContent();

  // Render content based on structure
  const renderContent = () => {
    if (activeSection === "pembuka") {
      const section = contentData.pembuka.sections[activeSubSection as keyof typeof contentData.pembuka.sections];
      
      if ('paragraphs' in section) {
        return section.paragraphs?.map((p, i) => (
          <p key={i} style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>{p}</p>
        ));
      }
      
      if ('content' in section) {
        return (section as any).content?.map((item: any, i: number) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.tahun}</div>
            <div style={{ opacity: 0.8 }}>{item.desc}</div>
          </div>
        ));
      }
      
      if ('items' in section) {
        return (section as any).items?.map((item: string, i: number) => (
          <div key={i} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ opacity: 0.5 }}>—</span>
            <span>{item}</span>
          </div>
        ));
      }
      
      if ('members' in section) {
        return (section as any).members?.map((member: string, i: number) => (
          <div key={i} style={{ marginBottom: '0.5rem', opacity: 0.9 }}>{member}</div>
        ));
      }
    }

    // For other sections
    if (activeSection === "arsitektur") {
      return (contentData.arsitektur as any).sections?.map((section: any, i: number) => (
        <div key={i} style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>{section.sub}</div>
          {section.items?.map((item: string, j: number) => (
            <div key={j} style={{ marginBottom: '0.5rem', opacity: 0.8 }}>• {item}</div>
          ))}
        </div>
      ));
    }

    if (activeSection === "instalasi") {
      return (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>REQUIREMENTS</div>
            {(contentData.instalasi as any).requirements?.map((req: string, i: number) => (
              <div key={i} style={{ marginBottom: '0.5rem', opacity: 0.8 }}>• {req}</div>
            ))}
          </div>
          {(contentData.instalasi as any).methods?.map((method: any, i: number) => (
            <div key={i} style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>{method.type}</div>
              {method.steps?.map((step: string, j: number) => (
                <div key={j} style={{ 
                  fontFamily: 'monospace', 
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '4px'
                }}>
                  $ {step}
                </div>
              ))}
            </div>
          ))}
        </>
      );
    }

    if (activeSection === "penggunaan") {
      return (
        <>
          {(contentData.penggunaan as any).categories?.map((cat: any, i: number) => (
            <div key={i} style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>{cat.name}</div>
              {cat.items?.map((item: string, j: number) => (
                <div key={j} style={{ marginBottom: '0.5rem', opacity: 0.8 }}>• {item}</div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>KEYBOARD SHORTCUTS</div>
            {(contentData.penggunaan as any).shortcuts?.map((shortcut: string, i: number) => (
              <div key={i} style={{ marginBottom: '0.5rem', fontFamily: 'monospace', opacity: 0.8 }}>{shortcut}</div>
            ))}
          </div>
        </>
      );
    }

    if (activeSection === "fitur") {
      return (contentData.fitur as any).list?.map((group: any, i: number) => (
        <div key={i} style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>{group.group}</div>
          {group.features?.map((feature: string, j: number) => (
            <div key={j} style={{ marginBottom: '0.5rem', opacity: 0.8 }}>• {feature}</div>
          ))}
        </div>
      ));
    }

    if (activeSection === "api") {
      return (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>AUTHENTICATION</div>
            <div style={{ opacity: 0.8 }}>{(contentData.api as any).auth}</div>
            <div style={{ opacity: 0.8, marginTop: '0.5rem' }}>Rate Limit: {(contentData.api as any).rateLimit}</div>
            <div style={{ opacity: 0.8 }}>Versions: {(contentData.api as any).versions}</div>
          </div>
          {(contentData.api as any).endpoints?.map((ep: any, i: number) => (
            <div key={i} style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>{ep.method}</span>
                <span style={{ fontFamily: 'monospace', opacity: 0.9 }}>{ep.path}</span>
              </div>
              <div style={{ opacity: 0.7, fontSize: '0.95rem' }}>{ep.desc}</div>
              {ep.params && <div style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.25rem' }}>Params: {ep.params}</div>}
              {ep.body && <div style={{ opacity: 0.5, fontSize: '0.9rem' }}>Body: {ep.body}</div>}
            </div>
          ))}
        </>
      );
    }

    if (activeSection === "keamanan") {
      return (contentData.keamanan as any).categories?.map((cat: any, i: number) => (
        <div key={i} style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>{cat.name}</div>
          {cat.items?.map((item: string, j: number) => (
            <div key={j} style={{ marginBottom: '0.5rem', opacity: 0.8 }}>• {item}</div>
          ))}
        </div>
      ));
    }

    if (activeSection === "troubleshoot") {
      return (contentData.troubleshoot as any).issues?.map((issue: any, i: number) => (
        <div key={i} style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem' }}>{issue.problem}</div>
          {issue.causes?.map((cause: string, j: number) => (
            <div key={j} style={{ marginBottom: '0.5rem', opacity: 0.8, marginLeft: '1rem' }}>• {cause}</div>
          ))}
        </div>
      ));
    }

    if (activeSection === "faq") {
      return (contentData.faq as any).questions?.map((faq: any, i: number) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Q: {faq.q}</div>
          <div style={{ opacity: 0.8, marginLeft: '1rem' }}>A: {faq.a}</div>
        </div>
      ));
    }

    return null;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      lineHeight: 1.6,
      letterSpacing: '0.2px'
    }}>
      
      {/* Left Navigation - Minimalist */}
      <div style={{
        width: '280px',
        padding: '2rem 1.5rem',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        overflowY: 'auto'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '500',
          marginBottom: '2.5rem',
          letterSpacing: '2px'
        }}>
          MENURU
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.hasDropdown) {
                    setShowPembukaDropdown(!showPembukaDropdown);
                  } else {
                    setActiveSection(item.id);
                    setShowPembukaDropdown(false);
                  }
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  color: activeSection === item.id ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  fontSize: '0.95rem',
                  fontWeight: activeSection === item.id ? '400' : '300',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  }
                }}
              >
                <span style={{ opacity: 0.5 }}>{item.icon}</span>
                <span>{item.title}</span>
                {item.hasDropdown && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.3 }}>▼</span>
                )}
              </button>

              {/* Dropdown */}
              {item.id === "pembuka" && showPembukaDropdown && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginLeft: '2.25rem' }}
                >
                  {item.dropdownItems?.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveSection("pembuka");
                        setActiveSubSection(subItem.id);
                        setShowPembukaDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.5rem',
                        background: 'none',
                        border: 'none',
                        color: activeSubSection === subItem.id ? '#ffffff' : 'rgba(255,255,255,0.4)',
                        fontSize: '0.9rem',
                        fontWeight: activeSubSection === subItem.id ? '400' : '300',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                      onMouseLeave={(e) => {
                        if (activeSubSection !== subItem.id) {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                        }
                      }}
                    >
                      {subItem.title}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: '280px',
        flex: 1,
        padding: '2rem 4rem',
        maxWidth: '1000px'
      }}>
        
        {/* Marquee */}
        <div style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginBottom: '3rem',
          padding: '0.75rem 0',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.9rem',
          letterSpacing: '1px',
          opacity: 0.6
        }}>
          <div ref={marqueeRef} style={{ display: 'inline-block' }}>
            DOCS MENURU <ArrowIcon /> DOKUMENTASI LENGKAP <ArrowIcon /> PANDUAN RESMI <ArrowIcon /> API REFERENCE <ArrowIcon /> BEST PRACTICES <ArrowIcon /> TUTORIAL <ArrowIcon /> FAQ <ArrowIcon /> DOCS MENURU <ArrowIcon />
          </div>
        </div>

        <div ref={contentRef}>
          
          {/* Title */}
          <div style={{
            fontSize: '3rem',
            fontWeight: '400',
            letterSpacing: '-0.5px',
            marginBottom: '2.5rem',
            lineHeight: 1.2
          }}>
            {activeSection === "pembuka" 
              ? contentData.pembuka.sections[activeSubSection as keyof typeof contentData.pembuka.sections]?.title
              : contentData[activeSection as keyof typeof contentData]?.title}
          </div>

          {/* Content */}
          <div style={{
            fontSize: '1rem',
            fontWeight: '300',
            maxWidth: '800px'
          }}>
            {renderContent()}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '4rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.85rem',
            opacity: 0.4,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>© 2024 MENURU</span>
            <span>Versi 2.0.0</span>
            <span>Tim Pengembang MENURU</span>
          </div>
        </div>
      </div>
    </div>
  );
}
