import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      backgroundColor: '#ffffff',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: 700, margin: 0, color: '#000' }}>404</h1>
      <p style={{ fontSize: '16px', color: '#666', marginTop: '8px' }}>
        Halaman tidak ditemukan
      </p>
      <Link
        href="/"
        style={{
          marginTop: '16px',
          padding: '8px 20px',
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
        }}
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
