// app/categories/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();

  const allCategories = [
    { id: 1, name: 'Panti Asuhan', icon: 'orphanage' },
    { id: 2, name: 'Panti Jompo', icon: 'elderly' },
    { id: 3, name: 'Masjid', icon: 'mosque' },
    { id: 4, name: 'Pendidikan', icon: 'education' },
    { id: 5, name: 'Kesehatan', icon: 'health' },
    { id: 6, name: 'Umum', icon: 'general' },
    { id: 7, name: 'Bencana Alam', icon: 'disaster' },
    { id: 8, name: 'Yatim Piatu', icon: 'orphan' },
    { id: 9, name: 'Lingkungan', icon: 'environment' },
    { id: 10, name: 'Dakwah', icon: 'dawah' },
  ];

  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'orphanage':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9L12 3L21 9L12 15L3 9Z" />
            <path d="M12 15V21" />
            <path d="M8 12V18" />
            <path d="M16 12V18" />
            <path d="M6 21H18" />
          </svg>
        );
      case 'elderly':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M12 12V16" />
            <path d="M8 20L12 16L16 20" />
          </svg>
        );
      case 'mosque':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15 6H9L12 2Z" />
            <path d="M5 10L7 6H17L19 10H5Z" />
            <path d="M4 10H20V20H4V10Z" />
            <path d="M12 14V20" />
            <path d="M8 14H16" />
          </svg>
        );
      case 'education':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3L2 8L12 13L22 8L12 3Z" />
            <path d="M2 8V16" />
            <path d="M6 11V17" />
            <path d="M18 11V17" />
            <path d="M22 8V16" />
            <path d="M12 13V21" />
          </svg>
        );
      case 'health':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L12 6" />
            <path d="M12 10L12 14" />
            <path d="M12 18L12 22" />
            <path d="M2 12L6 12" />
            <path d="M10 12L14 12" />
            <path d="M18 12L22 12" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        );
      case 'general':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8L12 12" />
            <path d="M12 16L12.01 16" />
          </svg>
        );
      case 'disaster':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15 6H9L12 2Z" />
            <path d="M4 14L12 8L20 14L12 20L4 14Z" />
          </svg>
        );
      case 'orphan':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3" />
            <path d="M6 21L12 15L18 21" />
          </svg>
        );
      case 'environment':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15 6H9L12 2Z" />
            <path d="M5 10L12 6L19 10" />
            <path d="M12 6V16" />
          </svg>
        );
      case 'dawah':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4L20 20" />
            <path d="M20 4L4 20" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories/${categoryName.toLowerCase()}`);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                  {renderIcon(category.icon)}
                </div>
                <span style={styles.categoryName}>{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hubot+Sans:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Hubot Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
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
    backgroundColor: '#000000',
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
    backgroundColor: '#000000',
    color: '#ffffff',
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
    color: '#ffffff',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
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
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    rowGap: '24px',
    paddingBottom: '20px',
  },
  categoryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    padding: '16px',
    backgroundColor: '#1c1c1e',
    borderRadius: '16px',
  },
  categoryIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '32px',
    backgroundColor: '#2c2c2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: '#ffffff',
  },
  categoryName: {
    fontSize: '14px',
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
};
