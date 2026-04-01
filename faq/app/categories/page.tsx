'use client';

import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();

  const allCategories = [
    { id: 1, name: 'Panti Asuhan', icon: '🏠' },
    { id: 2, name: 'Panti Jompo', icon: '👴' },
    { id: 3, name: 'Masjid', icon: '🕌' },
    { id: 4, name: 'Pendidikan', icon: '📚' },
    { id: 5, name: 'Kesehatan', icon: '🏥' },
    { id: 6, name: 'Umum', icon: '🤝' },
    { id: 7, name: 'Bencana Alam', icon: '🌊' },
    { id: 8, name: 'Yatim Piatu', icon: '👧' },
    { id: 9, name: 'Lingkungan', icon: '🌱' },
    { id: 10, name: 'Dakwah', icon: '📖' },
  ];

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories/${categoryName.toLowerCase()}`);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 style={styles.title}>Kategori Donasi</h1>
          <div style={styles.placeholder} />
        </div>

        <div style={styles.content}>
          <div style={styles.categoryGrid}>
            {allCategories.map((category) => (
              <div 
                key={category.id} 
                style={styles.categoryItem}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div style={styles.categoryIcon}>
                  <span style={styles.categoryIconText}>{category.icon}</span>
                </div>
                <span style={styles.categoryName}>{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 24px',
    backgroundColor: '#000',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'env(safe-area-inset-top)',
    marginBottom: '24px',
    flexShrink: 0,
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  placeholder: {
    width: '40px',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    rowGap: '24px',
    paddingBottom: '20px',
  },
  categoryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  categoryIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '35px',
    backgroundColor: '#1c1c1e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  categoryIconText: {
    fontSize: '32px',
  },
  categoryName: {
    fontSize: '12px',
    color: '#8e8e93',
    textAlign: 'center',
    fontWeight: '500',
  },
};
