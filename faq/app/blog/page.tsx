'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BlogPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("pendahuluan");

  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // SVG Arrow Components - Minimalist
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
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  // Daftar Isi
  const daftarIsi = [
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

  // Scroll ke section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: 'white',
      position: 'relative',
      padding: isMobile ? '20px' : '40px',
    }}>
      
      {/* Halaman Utama - Fixed Top Right */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '20px' : '40px',
        right: isMobile ? '20px' : '40px',
        zIndex: 100,
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'white',
        }}>
          <span style={{
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: 'normal',
          }}>
            Halaman Utama
          </span>
          <NorthEastArrow 
            width={isMobile ? 20 : 24} 
            height={isMobile ? 20 : 24} 
          />
        </Link>
      </div>

      {/* Header Blog */}
      <div style={{
        maxWidth: '800px',
        margin: isMobile ? '80px auto 40px' : '100px auto 60px',
        textAlign: 'right',
      }}>
        <h1 style={{
          fontSize: isMobile ? '3rem' : '5rem',
          fontWeight: 'normal',
          color: 'white',
          margin: '0 0 5px 0',
          letterSpacing: '2px',
        }}>
          Blog
        </h1>
        <p style={{
          fontSize: isMobile ? '1rem' : '1.2rem',
          fontWeight: 'normal',
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 20px 0',
        }}>
          Cerita Mahasiswa
        </p>
        <h2 style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: 'normal',
          color: 'white',
          margin: '20px 0 10px 0',
          lineHeight: '1.4',
        }}>
          Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '20px',
          marginTop: '20px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
        }}>
          <span>Admin</span>
          <span>13 Februari 2026</span>
          <span>8 menit</span>
        </div>
      </div>

      {/* Daftar Isi - Minimalist */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 40px',
        padding: '20px 0',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: isMobile ? '10px' : '15px',
          justifyContent: 'flex-end',
        }}>
          {daftarIsi.map((item, index) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '5px 0',
                color: activeSection === item.id ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                cursor: 'pointer',
                fontWeight: 'normal',
                borderBottom: activeSection === item.id ? '1px solid white' : 'none',
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Blog */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        
        {/* Foto Utama */}
        <div style={{
          marginBottom: '50px',
        }}>
          <img 
            src="/images/1.jpg" 
            alt="Universitas Gunadarma"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '10px',
            textAlign: 'right',
          }}>
            Gedung Kampus Universitas Gunadarma
          </p>
        </div>

        {/* Articles */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '60px',
        }}>
          
          {/* Pendahuluan */}
          <section id="pendahuluan">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Pendahuluan
            </h3>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Masuk ke Universitas Gunadarma adalah salah satu keputusan terbesar dalam hidup saya. 
              Banyak orang bertanya, "Bagaimana rasanya?" Pertanyaan sederhana namun jawabannya sangat kompleks. 
              Ini bukan sekadar tentang perkuliahan, tapi tentang perjalanan menemukan jati diri, 
              bertemu dengan berbagai karakter manusia, dan belajar bahwa kehidupan tidak selalu hitam dan putih.
            </p>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Gunadarma mengajarkan saya bahwa pendidikan bukan hanya tentang nilai di atas kertas, 
              tapi tentang bagaimana kita berpikir kritis, menyelesaikan masalah, dan beradaptasi dengan perubahan. 
              Di sini, saya belajar bahwa kegagalan adalah bagian dari proses, dan kesuksesan adalah akumulasi dari ribuan percobaan.
            </p>
          </section>

          {/* Sejarah & Reputasi */}
          <section id="sejarah">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Sejarah & Reputasi
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '30px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                flex: '1',
                order: isMobile ? 1 : 2,
              }}>
                <p style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  lineHeight: '1.8',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '20px',
                  fontWeight: 'normal',
                  textAlign: 'right',
                }}>
                  Universitas Gunadarma berdiri pada tahun 1981, berawal dari sebuah kursus komputer kecil 
                  yang kemudian berkembang menjadi salah satu perguruan tinggi swasta terkemuka di Indonesia. 
                  Reputasi Gunadarma di bidang teknologi informasi dan komputer sudah tidak diragukan lagi.
                </p>
                <p style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  lineHeight: '1.8',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '20px',
                  fontWeight: 'normal',
                  textAlign: 'right',
                }}>
                  Banyak alumni Gunadarma yang kini bekerja di perusahaan-perusahaan besar, 
                  baik di dalam maupun luar negeri.
                </p>
              </div>
              <div style={{
                flex: isMobile ? '0 0 100%' : '0 0 200px',
                order: isMobile ? 2 : 1,
              }}>
                <img 
                  src="/images/2.jpg" 
                  alt="Sejarah Gunadarma"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </section>

          {/* Suasana Kampus */}
          <section id="suasana">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Suasana Kampus
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '20px',
              marginBottom: '20px',
            }}>
              <img 
                src="/images/3.jpg" 
                alt="Suasana Kampus"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <img 
                src="/images/4.jpg" 
                alt="Perpustakaan"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Suasana kampus Gunadarma selalu hidup. Dari pagi hingga malam, mahasiswa lalu-lalang 
              dengan berbagai aktivitas. Ada yang buru-buru masuk kelas, ada yang nongkrong di kantin, 
              ada juga yang asyik mengerjakan tugas di perpustakaan. Kampus ini tidak pernah tidur.
            </p>
          </section>

          {/* Kehidupan Akademik */}
          <section id="akademik">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Kehidupan Akademik
            </h3>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Sistem akademik di Gunadarma terkenal dengan disiplinnya. Absensi sidik jari, 
              tugas yang menumpuk, praktikum yang melelahkan, namun semua itu membentuk karakter 
              kami menjadi pribadi yang tangguh dan bertanggung jawab.
            </p>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Tugas besar atau yang sering disebut "tubesar" adalah momen yang mendewasakan. 
              Begadang berhari-hari, debugging kode sampai mata merah, dan akhirnya presentasi 
              di depan dosen. Rasanya campur aduk, tapi kepuasan saat aplikasi buatan sendiri 
              berjalan dengan sempurna tidak ternilai harganya.
            </p>
          </section>

          {/* Para Dosen */}
          <section id="dosen">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Para Dosen
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '30px',
              alignItems: 'flex-start',
            }}>
              <div style={{ flex: '1' }}>
                <p style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  lineHeight: '1.8',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '20px',
                  fontWeight: 'normal',
                  textAlign: 'right',
                }}>
                  Dosen-dosen di Gunadarma memiliki latar belakang yang beragam. Ada yang galak dan disiplin, 
                  ada juga yang santai dan humoris. Tapi satu hal yang pasti, mereka semua berdedikasi 
                  untuk mentransfer ilmu kepada mahasiswanya.
                </p>
                <p style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  lineHeight: '1.8',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '20px',
                  fontWeight: 'normal',
                  textAlign: 'right',
                }}>
                  Saya ingat dosen pemrograman yang selalu berkata, "Coding itu seperti seni, 
                  butuh feeling dan latihan." Mereka tidak hanya mengajar, tapi juga menginspirasi.
                </p>
              </div>
              <div style={{
                flex: isMobile ? '0 0 100%' : '0 0 150px',
              }}>
                <img 
                  src="/images/5.jpg" 
                  alt="Dosen"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '0',
                  }}
                />
              </div>
            </div>
          </section>

          {/* Pertemanan & Relasi */}
          <section id="teman">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Pertemanan & Relasi
            </h3>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Harta paling berharga selama kuliah adalah teman-teman. Mereka yang menemani begadang 
              saat deadline, yang meminjamkan catatan ketika kita absen, yang menghibur ketika nilai 
              jelek, dan yang merayakan setiap pencapaian kecil.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '15px',
              marginTop: '20px',
            }}>
              <img 
                src="/images/6.jpg" 
                alt="Pertemanan"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <img 
                src="/images/7.jpg" 
                alt="Pertemanan"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <img 
                src="/images/8.jpg" 
                alt="Pertemanan"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          </section>

          {/* Fasilitas Kampus */}
          <section id="fasilitas">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Fasilitas Kampus
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '20px',
              marginBottom: '20px',
            }}>
              <img 
                src="/images/9.jpg" 
                alt="Laboratorium"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <img 
                src="/images/10.jpg" 
                alt="Perpustakaan"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Gunadarma memiliki fasilitas yang lengkap. Laboratorium komputer dengan spesifikasi tinggi, 
              perpustakaan dengan koleksi buku yang up-to-date, ruang kelas ber-AC, dan akses WiFi cepat.
            </p>
          </section>

          {/* Organisasi & Kegiatan */}
          <section id="organisasi">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Organisasi & Kegiatan
            </h3>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Selain akademik, Gunadarma juga aktif dalam berbagai organisasi dan kegiatan 
              ekstrakurikuler. Ada BEM, himpunan mahasiswa, UKM olahraga, seni, robotik, 
              dan masih banyak lagi.
            </p>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Saya sendiri aktif di UKM Robotik. Di sana saya belajar banyak hal yang tidak diajarkan 
              di kelas: kerja tim di bawah tekanan, manajemen proyek, dan problem-solving.
            </p>
          </section>

          {/* Tantangan & Hambatan */}
          <section id="tantangan">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Tantangan & Hambatan
            </h3>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Tidak selalu mulus. Ada kalanya saya merasa lelah, stres, bahkan ingin menyerah. 
              Tugas yang menumpuk, praktikum yang gagal, nilai yang tidak memuaskan, semua itu 
              adalah bagian dari proses pendewasaan.
            </p>
          </section>

          {/* Kesan & Pesan */}
          <section id="kesan">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Kesan & Pesan
            </h3>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px',
              fontWeight: 'normal',
              textAlign: 'right',
            }}>
              Universitas Gunadarma bukan sekadar tempat saya mengejar gelar sarjana. 
              Ini adalah rumah kedua yang membentuk saya menjadi pribadi yang lebih baik. 
              Di sini saya belajar bahwa kesuksesan bukan tentang seberapa cepat kita lulus, 
              tapi seberapa banyak ilmu dan pengalaman yang kita dapatkan.
            </p>
          </section>

          {/* Penutup */}
          <section id="penutup">
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              fontWeight: 'normal',
              color: 'white',
              margin: '0 0 20px 0',
            }}>
              Penutup
            </h3>
            <div style={{
              marginBottom: '40px',
            }}>
              <p style={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'right',
              }}>
                "Kuliah di Gunadarma rasanya seperti memasak. Kadang gosong, kadang terlalu asin, 
                tapi pada akhirnya kita akan menghasilkan hidangan yang layak disajikan. 
                Prosesnya tidak mudah, tapi hasilnya sepadan dengan usaha."
              </p>
              <p style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'right',
              }}>
                — Alumni Universitas Gunadarma 2026
              </p>
            </div>
            
            <img 
              src="/images/11.jpg" 
              alt="Wisuda"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </section>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        maxWidth: '600px',
        margin: '80px auto 0',
        padding: '40px 0 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.8rem',
        }}>
          © 2026
        </div>
        
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: 'white',
          fontSize: '0.9rem',
        }}>
          <span>Halaman Utama</span>
          <SouthWestArrow width={16} height={16} />
        </Link>
      </div>

    </div>
  );
}
