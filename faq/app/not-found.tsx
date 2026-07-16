// app/not-found.tsx
export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: 700, margin: 0 }}>404</h1>
      <p style={{ fontSize: '16px', color: '#666', marginTop: '8px' }}>
        Halaman tidak ditemukan
      </p>
    </div>
  );
}
