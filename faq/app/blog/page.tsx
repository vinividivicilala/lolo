'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BlogPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
      
      {/* Halaman Utama - Pojok Kanan Atas - BESAR DENGAN SVG SOUTH WEST ARROW */}
      <div style={{
        position: 'absolute',
        top: isMobile ? '30px' : '60px',
        right: isMobile ? '30px' : '60px',
        zIndex: 100,
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          textDecoration: 'none',
          color: 'white',
        }}>
          <span style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 'normal',
          }}>
            Halaman Utama
          </span>
          <SouthWestArrow 
            width={isMobile ? 50 : 80} 
            height={isMobile ? 50 : 80} 
          />
        </Link>
      </div>

      {/* Blog Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: isMobile ? '100px 0 40px' : '150px 0 60px',
      }}>
        
        {/* Judul Blog */}
        <h1 style={{
          fontSize: isMobile ? '2.5rem' : '3.5rem',
          fontWeight: 'normal',
          color: 'white',
          marginBottom: '40px',
          lineHeight: '1.2',
        }}>
          Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma
        </h1>

        {/* Konten Blog - Tanpa Meta Info */}
        <div style={{
          fontSize: isMobile ? '1.1rem' : '1.2rem',
          lineHeight: '1.8',
          color: '#e0e0e0',
        }}>
          
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
          
          <p style={{ marginBottom: '1.5em' }}>
            Universitas Gunadarma berdiri pada tahun 1981, berawal dari sebuah kursus komputer kecil 
            yang kemudian berkembang menjadi salah satu perguruan tinggi swasta terkemuka di Indonesia. 
            Reputasi Gunadarma di bidang teknologi informasi dan komputer sudah tidak diragukan lagi.
          </p>
          
          <p style={{ marginBottom: '1.5em' }}>
            Suasana kampus Gunadarma selalu hidup. Dari pagi hingga malam, mahasiswa lalu-lalang 
            dengan berbagai aktivitas. Ada yang buru-buru masuk kelas, ada yang nongkrong di kantin, 
            ada juga yang asyik mengerjakan tugas di perpustakaan. Kampus ini tidak pernah tidur.
          </p>
          
          <p style={{ marginBottom: '1.5em' }}>
            Sistem akademik di Gunadarma terkenal dengan disiplinnya. Absensi sidik jari, 
            tugas yang menumpuk, praktikum yang melelahkan, namun semua itu membentuk karakter 
            kami menjadi pribadi yang tangguh dan bertanggung jawab.
          </p>
          
          <p style={{ marginBottom: '1.5em' }}>
            Dosen-dosen di Gunadarma memiliki latar belakang yang beragam. Ada yang galak dan disiplin, 
            ada juga yang santai dan humoris. Tapi satu hal yang pasti, mereka semua berdedikasi 
            untuk mentransfer ilmu kepada mahasiswanya.
          </p>
          
          <p style={{ marginBottom: '1.5em' }}>
            Harta paling berharga selama kuliah adalah teman-teman. Mereka yang menemani begadang 
            saat deadline, yang meminjamkan catatan ketika kita absen, yang menghibur ketika nilai 
            jelek, dan yang merayakan setiap pencapaian kecil.
          </p>
          
          <p style={{ marginBottom: '1.5em' }}>
            Gunadarma memiliki fasilitas yang lengkap. Laboratorium komputer dengan spesifikasi tinggi, 
            perpustakaan dengan koleksi buku yang up-to-date, ruang kelas ber-AC, akses WiFi cepat, 
            dan area parkir yang luas. Semua mendukung proses belajar mengajar.
          </p>
          
          <p style={{ marginBottom: '1.5em' }}>
            Selain akademik, Gunadarma juga aktif dalam berbagai organisasi dan kegiatan 
            ekstrakurikuler. Ada BEM, himpunan mahasiswa, UKM olahraga, seni, robotik, 
            dan masih banyak lagi. Mahasiswa diberi kebebasan untuk mengembangkan minat dan bakat.
          </p>
          
          <p style={{ marginBottom: '1.5em' }}>
            Tidak selalu mulus. Ada kalanya saya merasa lelah, stres, bahkan ingin menyerah. 
            Tugas yang menumpuk, praktikum yang gagal, nilai yang tidak memuaskan, semua itu 
            adalah bagian dari proses pendewasaan.
          </p>
          
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
          
        </div>
        
        {/* Footer - Tanpa Quote, Hanya Copyright */}
        <div style={{
          marginTop: '60px',
          paddingTop: '20px',
          borderTop: '1px solid #333333',
          fontSize: isMobile ? '0.9rem' : '1rem',
          color: '#666666',
          textAlign: 'center',
        }}>
          © 2026
        </div>
        
      </div>

    </div>
  );
}
