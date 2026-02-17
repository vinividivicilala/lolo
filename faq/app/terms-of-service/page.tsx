'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function TermsOfServicePage(): React.JSX.Element {
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
          <span style={{ fontSize: '3rem' }}>KETENTUAN LAYANAN</span>
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
            Selamat datang di platform notifikasi PT. Wawa Digital. Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak dapat mengakses layanan.
          </p>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Layanan kami menyediakan platform untuk mengirim dan menerima notifikasi, berinteraksi melalui komentar dan reaksi, serta mengelola komunikasi digital dalam organisasi Anda.
          </p>
        </div>

        {/* Akun Pengguna */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Akun Pengguna
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.6rem',
              fontWeight: 'normal',
              marginBottom: '1rem',
              color: '#ffffff'
            }}>
              Pendaftaran Akun
            </h3>
            <p style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc'
            }}>
              Untuk mengakses fitur tertentu, Anda可能需要 mendaftar akun. Anda setuju untuk memberikan informasi yang akurat, lengkap, dan terkini. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda dan bertanggung jawab atas semua aktivitas yang terjadi di akun Anda.
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.6rem',
              fontWeight: 'normal',
              marginBottom: '1rem',
              color: '#ffffff'
            }}>
              Pengguna Anonim
            </h3>
            <p style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc'
            }}>
              Anda dapat mengakses layanan tertentu sebagai pengguna anonim. Dalam hal ini, kami akan menetapkan ID anonim yang disimpan di browser Anda. ID ini tidak terhubung ke informasi pribadi Anda kecuali Anda memilih untuk mendaftar.
            </p>
          </div>
        </div>

        {/* Penggunaan Layanan */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Penggunaan Layanan
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.6rem',
              fontWeight: 'normal',
              marginBottom: '1rem',
              color: '#ffffff'
            }}>
              Fitur yang Tersedia
            </h3>
            <ul style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.8rem' }}>Membuat dan mengirim notifikasi ke pengguna atau email</li>
              <li style={{ marginBottom: '0.8rem' }}>Menjadwalkan notifikasi untuk waktu tertentu</li>
              <li style={{ marginBottom: '0.8rem' }}>Menambahkan berbagai jenis link (YouTube, PDF, gambar, video)</li>
              <li style={{ marginBottom: '0.8rem' }}>Memberikan reaksi dengan emoticon pada notifikasi</li>
              <li style={{ marginBottom: '0.8rem' }}>Berkomentar dan membalas komentar</li>
              <li>Menyukai notifikasi, komentar, dan balasan</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.6rem',
              fontWeight: 'normal',
              marginBottom: '1rem',
              color: '#ffffff'
            }}>
              Batasan Penggunaan
            </h3>
            <p style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc',
              marginBottom: '1rem'
            }}>
              Anda setuju untuk tidak:
            </p>
            <ul style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              color: '#cccccc',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.8rem' }}>Menggunakan layanan untuk tujuan ilegal</li>
              <li style={{ marginBottom: '0.8rem' }}>Mengirim spam atau konten yang mengganggu</li>
              <li style={{ marginBottom: '0.8rem' }}>Menyebarkan malware atau kode berbahaya</li>
              <li style={{ marginBottom: '0.8rem' }}>Melanggar hak kekayaan intelektual</li>
              <li style={{ marginBottom: '0.8rem' }}>Mencoba mengakses akun pengguna lain</li>
              <li>Menggunakan layanan dengan cara yang dapat merusak atau membebani infrastruktur kami</li>
            </ul>
          </div>
        </div>

        {/* Konten Pengguna */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Konten Pengguna
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Anda mempertahankan kepemilikan atas konten yang Anda posting di layanan kami. Dengan memposting konten, Anda memberikan kami lisensi non-eksklusif, bebas royalti, di seluruh dunia untuk menggunakan, menampilkan, dan mendistribusikan konten Anda sehubungan dengan penyediaan layanan.
          </p>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Anda bertanggung jawab penuh atas konten yang Anda posting. Kami berhak, tetapi tidak berkewajiban, untuk menghapus konten yang melanggar ketentuan ini.
          </p>
        </div>

        {/* Hak Kekayaan Intelektual */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Hak Kekayaan Intelektual
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Layanan dan konten aslinya (tidak termasuk konten yang disediakan oleh pengguna), fitur, dan fungsionalitas adalah dan akan tetap menjadi milik eksklusif PT. Wawa Digital dan pemberi lisensinya. Layanan ini dilindungi oleh hak cipta, merek dagang, dan undang-undang lainnya.
          </p>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Anda tidak boleh menggunakan logo, merek dagang, atau elemen desain kami tanpa izin tertulis sebelumnya.
          </p>
        </div>

        {/* Batasan Tanggung Jawab */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Batasan Tanggung Jawab
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc',
            marginBottom: '1.5rem'
          }}>
            Dalam batas maksimum yang diizinkan oleh hukum yang berlaku, PT. Wawa Digital tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, konsekuensial, atau punitif, termasuk tanpa batasan, kehilangan keuntungan, data, penggunaan, goodwill, atau kerugian tidak berwujud lainnya.
          </p>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Layanan kami disediakan "sebagaimana adanya" dan "sebagaimana tersedia" tanpa jaminan apa pun.
          </p>
        </div>

        {/* Penghentian Layanan */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Penghentian Layanan
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Kami dapat menghentikan atau menangguhkan akses Anda ke Layanan kami segera, tanpa pemberitahuan atau tanggung jawab, karena alasan apa pun, termasuk jika Anda melanggar Ketentuan. Setelah penghentian, hak Anda untuk menggunakan Layanan akan segera berakhir.
          </p>
        </div>

        {/* Hukum yang Berlaku */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Hukum yang Berlaku
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Ketentuan ini akan diatur dan ditafsirkan sesuai dengan hukum Indonesia, tanpa memperhatikan ketentuan konflik hukumnya.
          </p>
        </div>

        {/* Perubahan Ketentuan */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            Perubahan Ketentuan
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            color: '#cccccc'
          }}>
            Kami berhak untuk mengubah atau mengganti Ketentuan ini kapan saja. Jika revisi bersifat material, kami akan memberikan pemberitahuan setidaknya 30 hari sebelum ketentuan baru berlaku. Dengan terus mengakses atau menggunakan Layanan kami setelah revisi menjadi efektif, Anda setuju untuk terikat oleh ketentuan yang direvisi.
          </p>
        </div>

        {/* Hubungi Kami */}
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
            Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini, silakan hubungi kami:
          </p>
          <div style={{
            fontSize: '1.3rem',
            lineHeight: '2',
            color: '#ffffff'
          }}>
            <div style={{ marginBottom: '0.8rem' }}>
              <strong>Email:</strong> legal@wawa44.com
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
            onClick={() => router.push('/privacy-policy')}
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
            <span>Baca Kebijakan Privasi</span>
            <SouthEastArrow />
          </button>
        </div>
      </div>
    </div>
  );
}
