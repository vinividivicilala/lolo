'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage(): React.JSX.Element {
  const router = useRouter();

  // SVG North East Arrow
  const NorthEastArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7L17 17" />
      <path d="M17 7H7" />
      <path d="M7 17V7" />
    </svg>
  );

  // SVG South East Arrow untuk footer
  const SouthEastArrow = () => (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5L19 19" />
      <path d="M19 5H5" />
      <path d="M5 19V5" />
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#ffffff',
      padding: '3rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: 0
            }}
          >
            <NorthEastArrow />
          </button>
          <span style={{ fontSize: '3rem' }}>KEBIJAKAN PRIVASI</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>PT. Wawa Digital</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        padding: '2rem 0'
      }}>
        {/* Last Updated */}
        <div style={{
          marginBottom: '3rem',
          padding: '1rem 0',
          borderBottom: '1px solid #333333',
          fontSize: '1.2rem',
          color: '#888888'
        }}>
          Terakhir diperbarui: 17 Februari 2026
        </div>

        {/* Pendahuluan */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Pendahuluan
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Kebijakan Privasi ini menjelaskan bagaimana PT. Wawa Digital ("kami", "kita", atau "milik kami") mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi pribadi Anda saat menggunakan layanan, situs web, dan aplikasi kami.
          </p>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Dengan mengakses atau menggunakan Layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi ini. Jika Anda tidak setuju dengan bagian mana pun, Anda tidak boleh mengakses layanan.
          </p>
        </div>

        {/* Informasi yang Kami Kumpulkan */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Informasi yang Kami Kumpulkan
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.6rem',
              fontWeight: 'normal',
              marginBottom: '1rem',
              color: '#ffffff'
            }}>
              Informasi yang Anda Berikan
            </h3>
            <p style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc',
              marginBottom: '1rem'
            }}>
              Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, termasuk:
            </p>
            <ul style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.8rem' }}>Informasi akun (nama, email, kata sandi)</li>
              <li style={{ marginBottom: '0.8rem' }}>Profil dan foto profil</li>
              <li style={{ marginBottom: '0.8rem' }}>Komentar dan interaksi dalam notifikasi</li>
              <li style={{ marginBottom: '0.8rem' }}>Reaksi dan like pada konten</li>
              <li>Komunikasi dengan tim dukungan</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.6rem',
              fontWeight: 'normal',
              marginBottom: '1rem',
              color: '#ffffff'
            }}>
              Informasi yang Dikumpulkan Secara Otomatis
            </h3>
            <p style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc',
              marginBottom: '1rem'
            }}>
              Saat Anda menggunakan Layanan kami, kami dapat mengumpulkan informasi secara otomatis, termasuk:
            </p>
            <ul style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.8rem' }}>Data penggunaan (waktu akses, fitur yang digunakan)</li>
              <li style={{ marginBottom: '0.8rem' }}>Informasi perangkat (tipe perangkat, sistem operasi)</li>
              <li style={{ marginBottom: '0.8rem' }}>Alamat IP dan data lokasi umum</li>
              <li>Cookie dan teknologi pelacakan serupa</li>
            </ul>
          </div>
        </div>

        {/* Penggunaan Informasi */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Bagaimana Kami Menggunakan Informasi Anda
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Kami menggunakan informasi yang dikumpulkan untuk:
          </p>
          <ul style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.8rem' }}>Menyediakan, memelihara, dan meningkatkan Layanan</li>
            <li style={{ marginBottom: '0.8rem' }}>Mengirimkan notifikasi dan pembaruan penting</li>
            <li style={{ marginBottom: '0.8rem' }}>Menanggapi komentar, pertanyaan, dan permintaan Anda</li>
            <li style={{ marginBottom: '0.8rem' }}>Memantau dan menganalisis tren, penggunaan, dan aktivitas</li>
            <li style={{ marginBottom: '0.8rem' }}>Mendeteksi, mencegah, dan mengatasi masalah teknis atau keamanan</li>
            <li>Mematuhi kewajiban hukum</li>
          </ul>
        </div>

        {/* Penyimpanan dan Keamanan */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Penyimpanan dan Keamanan Data
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Kami menggunakan layanan Firebase dari Google untuk menyimpan data Anda. Data disimpan di server yang aman dengan enkripsi dan protokol keamanan industri standar. Namun, tidak ada metode transmisi melalui internet atau metode penyimpanan elektronik yang 100% aman.
          </p>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Kami akan menyimpan informasi pribadi Anda selama diperlukan untuk memenuhi tujuan yang diuraikan dalam Kebijakan Privasi ini, kecuali periode penyimpanan yang lebih lama diperlukan atau diizinkan oleh hukum.
          </p>
        </div>

        {/* Berbagi Informasi */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Berbagi Informasi
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Kami tidak menjual, memperdagangkan, atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami dapat berbagi informasi dalam situasi berikut:
          </p>
          <ul style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.8rem' }}>Dengan penyedia layanan pihak ketiga yang membantu kami mengoperasikan Layanan</li>
            <li style={{ marginBottom: '0.8rem' }}>Jika diwajibkan oleh hukum atau untuk merespons proses hukum</li>
            <li style={{ marginBottom: '0.8rem' }}>Untuk melindungi hak, properti, atau keselamatan kami atau orang lain</li>
            <li>Dengan persetujuan Anda</li>
          </ul>
        </div>

        {/* Hak Anda */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Hak Privasi Anda
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Tergantung pada lokasi Anda, Anda mungkin memiliki hak tertentu terkait informasi pribadi Anda, termasuk:
          </p>
          <ul style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.8rem' }}>Hak untuk mengakses informasi pribadi Anda</li>
            <li style={{ marginBottom: '0.8rem' }}>Hak untuk memperbaiki informasi yang tidak akurat</li>
            <li style={{ marginBottom: '0.8rem' }}>Hak untuk menghapus informasi pribadi Anda</li>
            <li style={{ marginBottom: '0.8rem' }}>Hak untuk membatasi atau menolak pemrosesan</li>
            <li>Hak untuk portabilitas data</li>
          </ul>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginTop: '1.5rem'
          }}>
            Untuk menggunakan hak-hak ini, silakan hubungi kami di privacy@wawa44.com
          </p>
        </div>

        {/* Cookie */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Cookie dan Teknologi Pelacakan
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Kami menggunakan cookie dan teknologi serupa untuk melacak aktivitas di Layanan kami dan menyimpan informasi tertentu. Anda dapat menginstruksikan browser Anda untuk menolak semua cookie atau untuk menunjukkan kapan cookie dikirim. Namun, jika Anda tidak menerima cookie, beberapa bagian dari Layanan kami mungkin tidak berfungsi dengan baik.
          </p>
        </div>

        {/* Perubahan Kebijakan */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Perubahan pada Kebijakan Privasi Ini
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan dengan memposting Kebijakan Privasi baru di halaman ini dan memperbarui tanggal "Terakhir diperbarui" di bagian atas. Anda disarankan untuk meninjau Kebijakan Privasi ini secara berkala untuk setiap perubahan.
          </p>
        </div>

        {/* Kontak */}
        <div style={{ 
          marginBottom: '4rem',
          padding: '3rem',
          border: '1px solid #333333',
          borderRadius: '16px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Hubungi Kami
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami:
          </p>
          <div style={{
            fontSize: '1.3rem',
            lineHeight: '2',
            color: '#ffffff'
          }}>
            <div style={{ marginBottom: '0.8rem' }}>
              <strong>Email:</strong> privacy@wawa44.com
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <strong>Alamat:</strong> Jl. Contoh No. 123, Jakarta, Indonesia
            </div>
            <div>
              <strong>Telepon:</strong> +62 21 1234 5678
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid #333333'
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'none',
              border: 'none',
              color: '#888888',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <NorthEastArrow />
            <span>Kembali ke Beranda</span>
          </button>

          <button
            onClick={() => router.push('/terms-of-service')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'none',
              border: 'none',
              color: '#888888',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span>Baca Ketentuan Layanan</span>
            <SouthEastArrow />
          </button>
        </div>
      </div>
    </div>
  );
}
