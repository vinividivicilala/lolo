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

  // SVG Arrow Components - BESAR
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

  const NorthEastArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
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
      <path d="M7 7L17 7" stroke="white"/>
      <path d="M7 7L7 17" stroke="white"/>
      <path d="M7 7L21 21" stroke="white"/>
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
        <div style={{ color: 'white', fontSize: '2rem' }}>Loading...</div>
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
      padding: isMobile ? '30px' : '60px',
    }}>
      
      {/* Halaman Utama - Pojok Kanan Atas */}
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
          <NorthEastArrow 
            width={isMobile ? 50 : 80} 
            height={isMobile ? 50 : 80} 
          />
        </Link>
      </div>

      {/* Header Blog - Rata Kanan */}
      <div style={{
        maxWidth: '1000px',
        margin: isMobile ? '120px auto 60px' : '150px auto 80px',
        textAlign: 'right',
      }}>
        <h1 style={{
          fontSize: isMobile ? '6rem' : '10rem',
          fontWeight: 'normal',
          color: 'white',
          margin: '0 0 20px 0',
          letterSpacing: '5px',
        }}>
          Blog
        </h1>
        
        <p style={{
          fontSize: isMobile ? '2rem' : '3rem',
          fontWeight: 'normal',
          color: 'rgba(255,255,255,0.8)',
          margin: '0 0 40px 0',
        }}>
          Cerita Mahasiswa
        </p>
        
        <h2 style={{
          fontSize: isMobile ? '2.5rem' : '4rem',
          fontWeight: 'normal',
          color: 'white',
          margin: '0 0 30px 0',
          lineHeight: '1.2',
        }}>
          Bagaimana Rasa nya Masuk Kuliah<br />
          Di Universitas Gunadarma
        </h2>
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '30px',
          marginTop: '30px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: isMobile ? '1.2rem' : '1.5rem',
        }}>
          <span>Admin</span>
          <span>13 Februari 2026</span>
          <span>8 menit</span>
        </div>
      </div>

      {/* Konten Blog - Tanpa Foto, Hanya Teks Besar */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '80px',
        }}>
          
          {/* Pendahuluan */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Pendahuluan
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Masuk ke Universitas Gunadarma adalah salah satu keputusan terbesar dalam hidup saya. 
              Banyak orang bertanya, "Bagaimana rasanya?" Pertanyaan sederhana namun jawabannya sangat kompleks. 
              Ini bukan sekadar tentang perkuliahan, tapi tentang perjalanan menemukan jati diri, 
              bertemu dengan berbagai karakter manusia, dan belajar bahwa kehidupan tidak selalu hitam dan putih.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Gunadarma mengajarkan saya bahwa pendidikan bukan hanya tentang nilai di atas kertas, 
              tapi tentang bagaimana kita berpikir kritis, menyelesaikan masalah, dan beradaptasi dengan perubahan. 
              Di sini, saya belajar bahwa kegagalan adalah bagian dari proses, dan kesuksesan adalah akumulasi dari ribuan percobaan.
            </p>
          </section>

          {/* Sejarah & Reputasi */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Sejarah & Reputasi
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Universitas Gunadarma berdiri pada tahun 1981, berawal dari sebuah kursus komputer kecil 
              yang kemudian berkembang menjadi salah satu perguruan tinggi swasta terkemuka di Indonesia. 
              Reputasi Gunadarma di bidang teknologi informasi dan komputer sudah tidak diragukan lagi.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Banyak alumni Gunadarma yang kini bekerja di perusahaan-perusahaan besar, 
              baik di dalam maupun luar negeri. Ini membuktikan bahwa kualitas pendidikan di sini 
              diakui secara nasional dan internasional.
            </p>
          </section>

          {/* Suasana Kampus */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Suasana Kampus
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Suasana kampus Gunadarma selalu hidup. Dari pagi hingga malam, mahasiswa lalu-lalang 
              dengan berbagai aktivitas. Ada yang buru-buru masuk kelas, ada yang nongkrong di kantin, 
              ada juga yang asyik mengerjakan tugas di perpustakaan. Kampus ini tidak pernah tidur.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Yang paling berkesan adalah ketika jam istirahat tiba. Kantin penuh sesak, 
              antrian panjang di depan gerobak bakso, dan tawa riang mahasiswa yang melepas penat. 
              Momen-momen sederhana inilah yang akan selalu saya ingat.
            </p>
          </section>

          {/* Kehidupan Akademik */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Kehidupan Akademik
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Sistem akademik di Gunadarma terkenal dengan disiplinnya. Absensi sidik jari, 
              tugas yang menumpuk, praktikum yang melelahkan, namun semua itu membentuk karakter 
              kami menjadi pribadi yang tangguh dan bertanggung jawab.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Tugas besar atau yang sering disebut tubesar adalah momok yang menakutkan sekaligus 
              momen yang mendewasakan. Begadang berhari-hari, debugging kode sampai mata merah, 
              dan akhirnya presentasi di depan dosen yang kritis. Rasanya campur aduk, tapi kepuasan 
              saat aplikasi buatan sendiri berjalan dengan sempurna tidak ternilai harganya.
            </p>
          </section>

          {/* Para Dosen */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Para Dosen
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Dosen-dosen di Gunadarma memiliki latar belakang yang beragam. Ada yang galak dan disiplin, 
              ada juga yang santai dan humoris. Tapi satu hal yang pasti, mereka semua berdedikasi 
              untuk mentransfer ilmu kepada mahasiswanya.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Saya ingat dosen pemrograman yang selalu berkata, Coding itu seperti seni, 
              butuh feeling dan latihan. Atau dosen basis data yang dengan sabar menjelaskan 
              normalisasi sampai kami benar-benar paham. Mereka tidak hanya mengajar, tapi juga 
              menginspirasi.
            </p>
          </section>

          {/* Pertemanan & Relasi */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Pertemanan & Relasi
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Harta paling berharga selama kuliah adalah teman-teman. Mereka yang menemani begadang 
              saat deadline, yang meminjamkan catatan ketika kita absen, yang menghibur ketika nilai 
              jelek, dan yang merayakan setiap pencapaian kecil.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Dari sekadar teman sekelas, menjadi sahabat, bahkan keluarga. Kami saling mengenal 
              karakter masing-masing, tahu siapa yang jago coding, siapa yang jago desain, siapa 
              yang jago presentasi. Kerja sama tim yang solid terbentuk secara alami.
            </p>
          </section>

          {/* Fasilitas Kampus */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Fasilitas Kampus
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Gunadarma memiliki fasilitas yang lengkap. Laboratorium komputer dengan spesifikasi tinggi, 
              perpustakaan dengan koleksi buku yang up-to-date, ruang kelas ber-AC, akses WiFi cepat, 
              dan area parkir yang luas. Semua mendukung proses belajar mengajar.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Yang paling saya sukai adalah perpustakaannya. Selain koleksi bukunya yang lengkap, 
              suasananya nyaman untuk belajar. Banyak mahasiswa menghabiskan waktu berjam-jam di sini, 
              membaca buku, mengerjakan tugas, atau sekadar mencari inspirasi.
            </p>
          </section>

          {/* Organisasi & Kegiatan */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Organisasi & Kegiatan
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Selain akademik, Gunadarma juga aktif dalam berbagai organisasi dan kegiatan 
              ekstrakurikuler. Ada BEM, himpunan mahasiswa, UKM olahraga, seni, robotik, 
              dan masih banyak lagi. Mahasiswa diberi kebebasan untuk mengembangkan minat dan bakat.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Saya sendiri aktif di UKM Robotik. Di sana saya belajar banyak hal yang tidak diajarkan 
              di kelas: kerja tim di bawah tekanan, manajemen proyek, dan problem-solving. Pengalaman 
              mengikuti kontes robotika nasional adalah salah satu pencapaian terbesar saya selama kuliah.
            </p>
          </section>

          {/* Tantangan & Hambatan */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Tantangan & Hambatan
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Tidak selalu mulus. Ada kalanya saya merasa lelah, stres, bahkan ingin menyerah. 
              Tugas yang menumpuk, praktikum yang gagal, nilai yang tidak memuaskan, semua itu 
              adalah bagian dari proses pendewasaan.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Tantangan terbesar adalah membagi waktu antara kuliah, organisasi, dan kehidupan pribadi. 
              Seringkali saya harus begadang demi menyelesaikan semua tanggungan. Tapi justru dari 
              situ saya belajar tentang prioritas dan manajemen waktu.
            </p>
          </section>

          {/* Kesan & Pesan */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Kesan & Pesan
            </h3>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Universitas Gunadarma bukan sekadar tempat saya mengejar gelar sarjana. 
              Ini adalah rumah kedua yang membentuk saya menjadi pribadi yang lebih baik. 
              Di sini saya belajar bahwa kesuksesan bukan tentang seberapa cepat kita lulus, 
              tapi seberapa banyak ilmu dan pengalaman yang kita dapatkan.
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Pesan saya untuk adik-adik yang akan berkuliah di Gunadarma: nikmati setiap prosesnya. 
              Jangan terlalu fokus pada nilai, tapi kejarlah ilmu dan pengalaman. Aktiflah di organisasi, 
              perbanyak relasi, dan jangan takut gagal. Karena di Gunadarma, kita tidak hanya dididik 
              menjadi sarjana, tapi juga menjadi manusia yang bermanfaat bagi sesama.
            </p>
          </section>

          {/* Penutup */}
          <section>
            <h3 style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 30px 0',
            }}>
              Penutup
            </h3>
            <div style={{
              marginBottom: '40px',
            }}>
              <p style={{
                fontSize: isMobile ? '1.8rem' : '2.4rem',
                lineHeight: '1.6',
                color: 'white',
                marginBottom: '30px',
                fontWeight: 'normal',
                textAlign: 'right',
              }}>
                "Kuliah di Gunadarma rasanya seperti memasak. Kadang gosong, kadang terlalu asin, 
                tapi pada akhirnya kita akan menghasilkan hidangan yang layak disajikan. 
                Prosesnya tidak mudah, tapi hasilnya sepadan dengan usaha."
              </p>
              <p style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'right',
              }}>
                — Alumni Universitas Gunadarma 2026
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        maxWidth: '900px',
        margin: '100px auto 0',
        padding: '40px 0',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: isMobile ? '1.2rem' : '1.5rem',
        }}>
          © 2026
        </div>
        
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          textDecoration: 'none',
          color: 'white',
        }}>
          <span style={{
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 'normal',
          }}>
            Halaman Utama
          </span>
          <SouthWestArrow 
            width={isMobile ? 40 : 60} 
            height={isMobile ? 40 : 60} 
          />
        </Link>
      </div>

    </div>
  );
}
