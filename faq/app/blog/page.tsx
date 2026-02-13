'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

  // SVG Arrow Components
  const NorthEastArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M7 7L12 12" stroke="white"/>
      <path d="M7 7H12" stroke="white"/>
      <path d="M7 7V12" stroke="white"/>
    </svg>
  );

  const SouthWestArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M17 7L12 12" stroke="white"/>
      <path d="M17 7H12" stroke="white"/>
      <path d="M17 7V12" stroke="white"/>
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
      backgroundColor: '#0a0a0a',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.02) 0%, transparent 30%)',
      fontFamily: 'Helvetica, Arial, sans-serif',
      position: 'relative',
    }}>
      {/* HALAMAN UTAMA - RATA KANAN */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '30px' : '50px',
        right: isMobile ? '20px' : '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        zIndex: 100,
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          textDecoration: 'none',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: isMobile ? '12px 20px' : '15px 25px',
          borderRadius: '50px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(20,20,20,0.9)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }}
        >
          <span style={{
            fontSize: isMobile ? '1.2rem' : '1.4rem',
            fontWeight: '400',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Halaman Utama
          </span>
          <NorthEastArrow 
            width={isMobile ? 24 : 30} 
            height={isMobile ? 24 : 30} 
            style={{ opacity: 0.9 }}
          />
        </Link>
      </div>

      {/* HEADER BLOG - RATA KANAN */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '100px 20px 40px' : '120px 40px 60px',
        textAlign: 'right',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}>
          <h1 style={{
            fontSize: isMobile ? '4rem' : '7rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 10px 0',
            lineHeight: '1',
            letterSpacing: '-2px',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(255,255,255,0.1)',
          }}>
            BLOG
          </h1>
          
          {/* TEMA BLOG */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '10px',
            marginBottom: '30px',
          }}>
            <div style={{
              width: isMobile ? '40px' : '60px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, white, transparent)',
            }} />
            <span style={{
              fontSize: isMobile ? '1.4rem' : '1.8rem',
              fontWeight: '300',
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}>
              Cerita Mahasiswa
            </span>
          </div>
          
          {/* JUDUL ARTIKEL */}
          <h2 style={{
            fontSize: isMobile ? '2.2rem' : '3.5rem',
            fontWeight: '500',
            color: 'white',
            margin: '20px 0 10px 0',
            lineHeight: '1.2',
            letterSpacing: '-1px',
            maxWidth: '900px',
            textAlign: 'right',
          }}>
            Bagaimana Rasa nya Masuk Kuliah<br />
            Di Universitas Gunadarma
          </h2>
          
          {/* META INFO */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '20px',
            marginTop: '20px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: isMobile ? '0.9rem' : '1rem',
          }}>
            <span>✧ Ditulis oleh Admin</span>
            <span>✧ 13 Februari 2026</span>
            <span>✧ 8 menit membaca</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - DENGAN DAFTAR ISI DI KANAN */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '0 20px' : '0 40px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '40px',
        position: 'relative',
      }}>
        
        {/* DAFTAR ISI - RATA KANAN */}
        {!isMobile && (
          <div style={{
            flex: '0 0 280px',
            position: 'sticky',
            top: '100px',
            alignSelf: 'flex-start',
            height: 'calc(100vh - 150px)',
            overflowY: 'auto',
            paddingRight: '20px',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 30px 0',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                borderBottom: '2px solid white',
                paddingBottom: '15px',
                display: 'inline-block',
              }}>
                DAFTAR ISI
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
              }}>
                {daftarIsi.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 15px',
                      background: activeSection === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none',
                      borderLeft: activeSection === item.id ? '3px solid white' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'right',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{
                      color: activeSection === item.id ? 'white' : 'rgba(255,255,255,0.6)',
                      fontSize: '0.95rem',
                      fontWeight: activeSection === item.id ? '500' : '300',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      {item.title}
                    </span>
                    <span style={{
                      color: activeSection === item.id ? 'white' : 'rgba(255,255,255,0.3)',
                      fontSize: '0.8rem',
                      marginLeft: '15px',
                    }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* BACK TO TOP */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '40px',
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '0.9rem',
                  letterSpacing: '2px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <SouthWestArrow width={18} height={18} style={{ transform: 'rotate(90deg)' }} />
                <span>KEMBALI KE ATAS</span>
              </button>
            </div>
          </div>
        )}

        {/* DAFTAR ISI MOBILE */}
        {isMobile && (
          <div style={{
            marginBottom: '40px',
            padding: '20px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'white',
              margin: '0 0 20px 0',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              DAFTAR ISI
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}>
              {daftarIsi.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    padding: '8px 12px',
                    background: activeSection === item.id ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    color: activeSection === item.id ? 'white' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                  }}
                >
                  {index + 1}. {item.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* KONTEN BLOG - RATA KANAN */}
        <div style={{
          flex: '1',
          maxWidth: isMobile ? '100%' : '800px',
          marginLeft: 'auto',
          textAlign: 'right',
        }}>
          
          {/* FOTO UTAMA */}
          <div style={{
            marginBottom: '50px',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}>
            <img 
              src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1186&q=80" 
              alt="Universitas Gunadarma"
              style={{
                width: '100%',
                height: isMobile ? '250px' : '400px',
                objectFit: 'cover',
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              padding: '30px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              color: 'white',
              textAlign: 'right',
            }}>
              <p style={{
                fontSize: isMobile ? '0.9rem' : '1.1rem',
                margin: 0,
                opacity: 0.9,
              }}>
                Gedung Kampus Universitas Gunadarma
              </p>
            </div>
          </div>

          {/* KONTEN ARTIKEL */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}>
            
            {/* PENDAHULUAN */}
            <section id="pendahuluan" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                01. Pendahuluan
              </h3>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Masuk ke Universitas Gunadarma adalah salah satu keputusan terbesar dalam hidup saya. 
                Banyak orang bertanya, "Bagaimana rasanya?" Pertanyaan sederhana namun jawabannya sangat kompleks. 
                Ini bukan sekadar tentang perkuliahan, tapi tentang perjalanan menemukan jati diri, 
                bertemu dengan berbagai karakter manusia, dan belajar bahwa kehidupan tidak selalu hitam dan putih.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Gunadarma mengajarkan saya bahwa pendidikan bukan hanya tentang nilai di atas kertas, 
                tapi tentang bagaimana kita berpikir kritis, menyelesaikan masalah, dan beradaptasi dengan perubahan. 
                Di sini, saya belajar bahwa kegagalan adalah bagian dari proses, dan kesuksesan adalah akumulasi dari ribuan percobaan.
              </p>
            </section>

            {/* SEJARAH & REPUTASI */}
            <section id="sejarah" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                02. Sejarah & Reputasi
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '30px',
                alignItems: 'center',
              }}>
                <div style={{
                  flex: '1',
                  order: isMobile ? 1 : 2,
                }}>
                  <p style={{
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                    lineHeight: '1.8',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '20px',
                    fontWeight: '300',
                    textAlign: 'right',
                  }}>
                    Universitas Gunadarma berdiri pada tahun 1981, berawal dari sebuah kursus komputer kecil 
                    yang kemudian berkembang menjadi salah satu perguruan tinggi swasta terkemuka di Indonesia. 
                    Reputasi Gunadarma di bidang teknologi informasi dan komputer sudah tidak diragukan lagi.
                  </p>
                  <p style={{
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                    lineHeight: '1.8',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '20px',
                    fontWeight: '300',
                    textAlign: 'right',
                  }}>
                    Banyak alumni Gunadarma yang kini bekerja di perusahaan-perusahaan besar, 
                    baik di dalam maupun luar negeri. Ini membuktikan bahwa kualitas pendidikan di sini 
                    diakui secara nasional dan internasional.
                  </p>
                </div>
                <div style={{
                  flex: '0 0 isMobile ? '100%' : '250px',
                  order: isMobile ? 2 : 1,
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                    alt="Sejarah Gunadarma"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                </div>
              </div>
            </section>

            {/* SUASANA KAMPUS */}
            <section id="suasana" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                03. Suasana Kampus
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '20px',
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Suasana Kampus"
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
                <img 
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Perpustakaan"
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
              </div>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Suasana kampus Gunadarma selalu hidup. Dari pagi hingga malam, mahasiswa lalu-lalang 
                dengan berbagai aktivitas. Ada yang buru-buru masuk kelas, ada yang nongkrong di kantin, 
                ada juga yang asyik mengerjakan tugas di perpustakaan. Kampus ini tidak pernah tidur.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Yang paling berkesan adalah ketika jam istirahat tiba. Kantin penuh sesak, 
                antrian panjang di depan gerobak bakso, dan tawa riang mahasiswa yang melepas penat. 
                Momen-momen sederhana inilah yang akan selalu saya ingat.
              </p>
            </section>

            {/* KEHIDUPAN AKADEMIK */}
            <section id="akademik" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                04. Kehidupan Akademik
              </h3>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Sistem akademik di Gunadarma terkenal dengan disiplinnya. Absensi sidik jari, 
                tugas yang menumpuk, praktikum yang melelahkan, namun semua itu membentuk karakter 
                kami menjadi pribadi yang tangguh dan bertanggung jawab.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Tugas besar atau yang sering disebut "tubesar" adalah momok yang menakutkan sekaligus 
                momen yang mendewasakan. Begadang berhari-hari, debugging kode sampai mata merah, 
                dan akhirnya presentasi di depan dosen yang kritis. Rasanya campur aduk, tapi kepuasan 
                saat aplikasi buatan sendiri berjalan dengan sempurna tidak ternilai harganya.
              </p>
            </section>

            {/* PARA DOSEN */}
            <section id="dosen" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                05. Para Dosen
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '30px',
                alignItems: 'center',
              }}>
                <div style={{
                  flex: '1',
                }}>
                  <p style={{
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                    lineHeight: '1.8',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '20px',
                    fontWeight: '300',
                    textAlign: 'right',
                  }}>
                    Dosen-dosen di Gunadarma memiliki latar belakang yang beragam. Ada yang galak dan disiplin, 
                    ada juga yang santai dan humoris. Tapi satu hal yang pasti, mereka semua berdedikasi 
                    untuk mentransfer ilmu kepada mahasiswanya.
                  </p>
                  <p style={{
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                    lineHeight: '1.8',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '20px',
                    fontWeight: '300',
                    textAlign: 'right',
                  }}>
                    Saya ingat dosen pemrograman yang selalu berkata, "Coding itu seperti seni, 
                    butuh feeling dan latihan." Atau dosen basis data yang dengan sabar menjelaskan 
                    normalisasi sampai kami benar-benar paham. Mereka tidak hanya mengajar, tapi juga 
                    menginspirasi.
                  </p>
                </div>
                <div style={{
                  flex: '0 0 isMobile ? '100%' : '200px',
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                    alt="Dosen"
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                  />
                </div>
              </div>
            </section>

            {/* PERTEMANAN & RELASI */}
            <section id="teman" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                06. Pertemanan & Relasi
              </h3>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Harta paling berharga selama kuliah adalah teman-teman. Mereka yang menemani begadang 
                saat deadline, yang meminjamkan catatan ketika kita absen, yang menghibur ketika nilai 
                jelek, dan yang merayakan setiap pencapaian kecil.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Dari sekadar teman sekelas, menjadi sahabat, bahkan keluarga. Kami saling mengenal 
                karakter masing-masing, tahu siapa yang jago coding, siapa yang jago desain, siapa 
                yang jago presentasi. Kerja sama tim yang solid terbentuk secara alami.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '15px',
                marginTop: '20px',
              }}>
                {[1,2,3].map((i) => (
                  <img 
                    key={i}
                    src={`https://images.unsplash.com/photo-${i === 1 ? '1522202176988-66273c2fd55f' : i === 2 ? '1517486808906-6ca8b6f8c42c' : '1529156069892-4561a8aacb43'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80`}
                    alt={`Pertemanan ${i}`}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                ))}
              </div>
            </section>

            {/* FASILITAS KAMPUS */}
            <section id="fasilitas" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                07. Fasilitas Kampus
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '30px',
                marginBottom: '20px',
              }}>
                <div style={{ flex: '1' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1186&q=80" 
                    alt="Laboratorium"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                </div>
                <div style={{ flex: '1' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1122&q=80" 
                    alt="Perpustakaan"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                </div>
              </div>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Gunadarma memiliki fasilitas yang lengkap. Laboratorium komputer dengan spesifikasi tinggi, 
                perpustakaan dengan koleksi buku yang up-to-date, ruang kelas ber-AC, akses WiFi cepat, 
                dan area parkir yang luas. Semua mendukung proses belajar mengajar.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Yang paling saya sukai adalah perpustakaannya. Selain koleksi bukunya yang lengkap, 
                suasananya nyaman untuk belajar. Banyak mahasiswa menghabiskan waktu berjam-jam di sini, 
                membaca buku, mengerjakan tugas, atau sekadar mencari inspirasi.
              </p>
            </section>

            {/* ORGANISASI & KEGIATAN */}
            <section id="organisasi" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                08. Organisasi & Kegiatan
              </h3>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Selain akademik, Gunadarma juga aktif dalam berbagai organisasi dan kegiatan 
                ekstrakurikuler. Ada BEM, himpunan mahasiswa, UKM olahraga, seni, robotik, 
                dan masih banyak lagi. Mahasiswa diberi kebebasan untuk mengembangkan minat dan bakat.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Saya sendiri aktif di UKM Robotik. Di sana saya belajar banyak hal yang tidak diajarkan 
                di kelas: kerja tim di bawah tekanan, manajemen proyek, dan problem-solving. Pengalaman 
                mengikuti kontes robotika nasional adalah salah satu pencapaian terbesar saya selama kuliah.
              </p>
            </section>

            {/* TANTANGAN & HAMBATAN */}
            <section id="tantangan" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                09. Tantangan & Hambatan
              </h3>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Tidak selalu mulus. Ada kalanya saya merasa lelah, stres, bahkan ingin menyerah. 
                Tugas yang menumpuk, praktikum yang gagal, nilai yang tidak memuaskan, semua itu 
                adalah bagian dari proses pendewasaan.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Tantangan terbesar adalah membagi waktu antara kuliah, organisasi, dan kehidupan pribadi. 
                Seringkali saya harus begadang demi menyelesaikan semua tanggungan. Tapi justru dari 
                situ saya belajar tentang prioritas dan manajemen waktu.
              </p>
            </section>

            {/* KESAN & PESAN */}
            <section id="kesan" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                10. Kesan & Pesan
              </h3>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Universitas Gunadarma bukan sekadar tempat saya mengejar gelar sarjana. 
                Ini adalah rumah kedua yang membentuk saya menjadi pribadi yang lebih baik. 
                Di sini saya belajar bahwa kesuksesan bukan tentang seberapa cepat kita lulus, 
                tapi seberapa banyak ilmu dan pengalaman yang kita dapatkan.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                lineHeight: '1.8',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '20px',
                fontWeight: '300',
                textAlign: 'right',
              }}>
                Pesan saya untuk adik-adik yang akan berkuliah di Gunadarma: nikmati setiap prosesnya. 
                Jangan terlalu fokus pada nilai, tapi kejarlah ilmu dan pengalaman. Aktiflah di organisasi, 
                perbanyak relasi, dan jangan takut gagal. Karena di Gunadarma, kita tidak hanya dididik 
                menjadi sarjana, tapi juga menjadi manusia yang bermanfaat bagi sesama.
              </p>
            </section>

            {/* PENUTUP */}
            <section id="penutup" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 20px 0',
                borderBottom: '2px solid rgba(255,255,255,0.2)',
                paddingBottom: '15px',
              }}>
                11. Penutup
              </h3>
              <div style={{
                padding: '30px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '40px',
              }}>
                <p style={{
                  fontSize: isMobile ? '1.2rem' : '1.4rem',
                  lineHeight: '1.8',
                  color: 'white',
                  marginBottom: '20px',
                  fontWeight: '400',
                  fontStyle: 'italic',
                  textAlign: 'right',
                }}>
                  "Kuliah di Gunadarma rasanya seperti memasak. Kadang gosong, kadang terlalu asin, 
                  tapi pada akhirnya kita akan menghasilkan hidangan yang layak disajikan. 
                  Prosesnya tidak mudah, tapi hasilnya sepadan dengan usaha."
                </p>
                <p style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'right',
                  marginTop: '20px',
                }}>
                  — Penulis, Alumni Universitas Gunadarma 2026
                </p>
              </div>
              
              {/* FOTO PENUTUP */}
              <img 
                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Wisuda"
                style={{
                  width: '100%',
                  height: isMobile ? '200px' : '300px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  marginTop: '20px',
                }}
              />
            </section>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        maxWidth: '1200px',
        margin: '80px auto 0',
        padding: isMobile ? '30px 20px' : '50px 40px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <span style={{
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: '600',
            marginBottom: '5px',
          }}>
            BLOG
          </span>
          <span style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.9rem',
          }}>
            © 2026 Cerita Mahasiswa
          </span>
        </div>
        
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'white',
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '30px',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }}
        >
          <SouthWestArrow width={20} height={20} style={{ transform: 'rotate(135deg)' }} />
          <span style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>HALAMAN UTAMA</span>
        </Link>
      </footer>
    </div>
  );
}
