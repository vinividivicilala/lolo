// app/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();

  const [favoriteCategories, setFavoriteCategories] = useState([
    { id: 1, name: 'Panti Asuhan', visitCount: 5 },
    { id: 2, name: 'Masjid', visitCount: 3 },
  ]);

  const allCategories = [
    { id: 1, name: 'Panti Asuhan' },
    { id: 2, name: 'Panti Jompo' },
    { id: 3, name: 'Masjid' },
    { id: 4, name: 'Pendidikan' },
    { id: 5, name: 'Kesehatan' },
    { id: 6, name: 'Umum' },
    { id: 7, name: 'Bencana Alam' },
    { id: 8, name: 'Yatim Piatu' },
    { id: 9, name: 'Lingkungan' },
    { id: 10, name: 'Dakwah' },
  ];

  useEffect(() => {
    // Simulate tracking category visits from localStorage or state
    const storedVisits = localStorage.getItem('categoryVisits');
    if (storedVisits) {
      const visits = JSON.parse(storedVisits);
      const sorted = Object.entries(visits)
        .map(([name, count]) => ({ name, visitCount: count as number }))
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 2);
      setFavoriteCategories(sorted);
    }
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    // Track visit count
    const storedVisits = localStorage.getItem('categoryVisits');
    let visits = storedVisits ? JSON.parse(storedVisits) : {};
    visits[categoryName] = (visits[categoryName] || 0) + 1;
    localStorage.setItem('categoryVisits', JSON.stringify(visits));
    
    router.push(`/categories/${categoryName.toLowerCase()}`);
  };

  const handleBack = () => {
    // Add exit animation before navigating back
    const container = document.querySelector('.categories-container');
    if (container) {
      container.classList.add('page-exit');
      setTimeout(() => {
        router.back();
      }, 300);
    } else {
      router.back();
    }
  };

  const renderNorthwestArrow = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 9L9 15" />
      <path d="M9 9L15 15" />
      <path d="M9 9H15V15" />
    </svg>
  );

  return (
    <>
      <div style={styles.wrapper}>
        <div style={styles.container} className="categories-container page-enter">
          <div style={styles.header}>
            <button onClick={handleBack} style={styles.backButton}>
              {renderNorthwestArrow()}
            </button>
            <h1 style={styles.title}>Categories</h1>
            <div style={styles.placeholder} />
          </div>

          <div style={styles.content}>
            {/* Favorite Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Menu Favorit</h2>
              <div style={styles.favoriteList}>
                {favoriteCategories.length === 0 ? (
                  <div style={styles.emptyFavorites}>Belum ada menu favorit</div>
                ) : (
                  favoriteCategories.map((category) => (
                    <div 
                      key={category.id} 
                      style={styles.favoriteItem}
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <span style={styles.favoriteName}>{category.name}</span>
                      <span style={styles.visitCount}>{category.visitCount} kali</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* All Categories Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Lainnya</h2>
              <div style={styles.categoryGrid}>
                {allCategories.map((category) => (
                  <div 
                    key={category.id} 
                    style={styles.categoryItem}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <span style={styles.categoryName}>{category.name}</span>
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
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutToLeft {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        
        .page-enter {
          animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .page-exit {
          animation: slideOutToLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        button {
          background: none;
          border: none;
          cursor: pointer;
        }
        
        ::-webkit-scrollbar {
          width: 0;
          background: transparent;
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'env(safe-area-inset-top)',
    marginBottom: '32px',
    flexShrink: 0,
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#ffffff',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  placeholder: {
    width: '36px',
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
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#8e8e93',
    marginBottom: '12px',
    letterSpacing: '-0.2px',
    textTransform: 'uppercase',
  },
  favoriteList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  favoriteItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    backgroundColor: '#1c1c1e',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  favoriteName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#ffffff',
  },
  visitCount: {
    fontSize: '13px',
    color: '#007aff',
    fontWeight: '500',
  },
  emptyFavorites: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#8e8e93',
    fontSize: '14px',
    backgroundColor: '#1c1c1e',
    borderRadius: '12px',
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
