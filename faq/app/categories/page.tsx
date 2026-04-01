// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  const categories = [
    'Panti Asuhan', 'Panti Jompo', 'Masjid', 'Pendidikan',
    'Kesehatan', 'Umum', 'Bencana Alam', 'Yatim Piatu',
    'Lingkungan', 'Dakwah'
  ];

  const handleCategoryClick = (categoryName: string) => {
    // Track visit count
    const storedVisits = localStorage.getItem('categoryVisits');
    let visits = storedVisits ? JSON.parse(storedVisits) : {};
    visits[categoryName] = (visits[categoryName] || 0) + 1;
    localStorage.setItem('categoryVisits', JSON.stringify(visits));
    
    router.push(`/categories/${categoryName.toLowerCase()}`);
  };

  const handleSeeAllClick = () => {
    router.push('/categories');
  };

  return (
    <>
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Donasi</h1>
          </div>

          <div style={styles.content}>
            {/* Categories Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Kategori</h2>
                <button onClick={handleSeeAllClick} style={styles.seeAllButton}>
                  Lihat semua
                </button>
              </div>
              <div style={styles.categoryGrid}>
                {categories.map((category, index) => (
                  <div
                    key={index}
                    style={styles.categoryItem}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <span style={styles.categoryName}>{category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hubot+Sans:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Hubot Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutToRight {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .home-enter {
          animation: slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .home-exit {
          animation: slideOutToRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .category-item-hover {
          transition: all 0.2s ease;
        }
        
        .category-item-hover:active {
          transform: scale(0.98);
        }
      `}</style>
    </>
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
    animation: 'slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'env(safe-area-inset-top)',
    marginBottom: '32px',
    flexShrink: 0,
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '20px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#8e8e93',
    letterSpacing: '-0.2px',
    textTransform: 'uppercase',
    margin: 0,
  },
  seeAllButton: {
    background: 'none',
    border: 'none',
    color: '#007aff',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'all 0.2s ease',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 8px',
    backgroundColor: 'transparent',
    borderRadius: '0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  categoryName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: '1.3',
  },
};
